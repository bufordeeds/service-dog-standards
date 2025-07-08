import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { loginSchema } from "~/lib/validations/auth";
import { verifyPassword, calculateProfileCompletion } from "~/lib/auth";
import { authConfig as baseAuthConfig } from "~/server/auth.config";

/**
 * Extended auth configuration with database providers
 * This extends the base config with providers that require database access
 */
const authConfig = {
  ...baseAuthConfig,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const validatedFields = loginSchema.safeParse(credentials);
        
        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;
        
        const user = await prisma.user.findUnique({
          where: { email },
          include: { 
            organization: true,
            agreements: true
          }
        });
        
        if (!user || !user.hashedPassword) {
          return null;
        }
        
        const passwordsMatch = await verifyPassword(password, user.hashedPassword);
        
        if (!passwordsMatch) {
          return null;
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        // Calculate profile completion
        const profileComplete = calculateProfileCompletion({
          ...user,
          role: user.role
        });

        return {
          id: user.id,
          email: user.email,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
          // Don't include image in JWT token - can cause headers too big error
          // image: user.profileImage,
          role: user.role,
          accountType: user.accountType,
          organizationId: user.organizationId,
          profileComplete,
          memberNumber: user.memberNumber ?? undefined,
          emailVerified: user.emailVerified,
        };
      }
    }),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
  ],
  callbacks: {
    ...baseAuthConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        // Initial sign in - add user data to token
        token.id = user.id;
        token.role = user.role;
        token.accountType = user.accountType;
        token.organizationId = user.organizationId;
        token.profileComplete = user.profileComplete;
        token.memberNumber = user.memberNumber;
        token.emailVerified = user.emailVerified;
      } else if (trigger === "update" && token.id) {
        // Only refresh user data when explicitly triggered by updateSession()
        try {
          const currentUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: { 
              agreements: { where: { isActive: true } }
            }
          });
          
          if (currentUser) {
            const profileComplete = calculateProfileCompletion({
              ...currentUser,
              role: currentUser.role
            });
            
            // Update token with fresh user data (excluding image to avoid large headers)
            token.profileComplete = profileComplete;
            token.name = currentUser.firstName && currentUser.lastName 
              ? `${currentUser.firstName} ${currentUser.lastName}` 
              : currentUser.email;
            // Don't store image in token - causes headers too big error
            // token.image = currentUser.profileImage;
          }
        } catch (error) {
          console.error('Error refreshing user data in JWT callback:', error);
          // Don't fail the entire auth flow if refresh fails
        }
      }
      return Promise.resolve(token);
    },
    async signIn({ user, account }) {
      // Handle OAuth account linking and email verification
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email ?? undefined }
        });
        
        if (existingUser && !existingUser.emailVerified) {
          // Auto-verify email for OAuth users
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: new Date() }
          });
        }
      }
      
      return true;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        // Don't include image in session - fetch from profile API when needed
        // session.user.image = token.image as string;
        session.user.role = token.role as string;
        session.user.accountType = token.accountType as string;
        session.user.organizationId = token.organizationId as string;
        session.user.profileComplete = token.profileComplete as number;
        session.user.memberNumber = token.memberNumber as string | undefined;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      
      return Promise.resolve(session);
    },
  },
  events: {
    async signIn(message) {
      // Update last login timestamp
      if (message.user.id) {
        await prisma.user.update({
          where: { id: message.user.id },
          data: { lastLoginAt: new Date() }
        });
      }
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

/**
 * Wrapper for `auth` function for server-side usage.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = auth;
