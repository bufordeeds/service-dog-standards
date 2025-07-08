import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { loginSchema } from "~/lib/validations/auth";
import { verifyPassword, calculateProfileCompletion } from "~/lib/auth";
import { authConfig as baseAuthConfig } from "~/server/auth.config";
import type { User } from "next-auth";
import type { UserRole, AccountType } from "@prisma/client";
import type { Address } from "@/types/api";

// Extended user type for auth
interface AuthUser extends User {
  id: string;
  role: UserRole;
  accountType: AccountType;
  organizationId: string;
  profileComplete: number;
  memberNumber?: string;
  emailVerified?: Date | null;
}

// JWT token type
interface AuthToken {
  id: string;
  role: UserRole;
  accountType: AccountType;
  organizationId: string;
  profileComplete: number;
  memberNumber?: string;
  emailVerified?: Date | null;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

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
          role: user.role,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          address: user.address as Address | undefined
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, trigger }: any) {
      if (user) {
        // Initial sign in - add user data to token
        const authUser = user as AuthUser;
        const authToken = token as AuthToken;
        authToken.id = authUser.id;
        authToken.role = authUser.role;
        authToken.accountType = authUser.accountType;
        authToken.organizationId = authUser.organizationId;
        authToken.profileComplete = authUser.profileComplete;
        authToken.memberNumber = authUser.memberNumber;
        authToken.emailVerified = authUser.emailVerified;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      } else if (trigger === "update" && typeof token.id === "string") {
        // Only refresh user data when explicitly triggered by updateSession()
        try {
          const authToken = token as AuthToken;
          const currentUser = await prisma.user.findUnique({
            where: { id: authToken.id },
            include: { 
              agreements: { where: { isActive: true } }
            }
          });
          
          if (currentUser) {
            const profileComplete = calculateProfileCompletion({
              ...currentUser,
              role: currentUser.role,
              address: currentUser.address as Address | undefined
            });
            
            // Update token with fresh user data (excluding image to avoid large headers)
            authToken.profileComplete = profileComplete;
            authToken.name = currentUser.firstName && currentUser.lastName 
              ? `${currentUser.firstName} ${currentUser.lastName}` 
              : currentUser.email ?? '';
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user, account }: any) {
      // Handle OAuth account linking and email verification
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
      if ((account as any)?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
          where: { email: (user as any)?.email ?? undefined }
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (session.user && token) {
        const authToken = token as AuthToken;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        session.user.id = authToken.id;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        session.user.name = authToken.name;
        // Don't include image in session - fetch from profile API when needed
        // session.user.image = authToken.image;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        session.user.role = authToken.role;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        session.user.accountType = authToken.accountType;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        session.user.organizationId = authToken.organizationId;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        session.user.profileComplete = authToken.profileComplete;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        session.user.memberNumber = authToken.memberNumber;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        session.user.emailVerified = authToken.emailVerified;
      }
      
      return Promise.resolve(session);
    },
  },
  events: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn(message: any) {
      // Update last login timestamp
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
      if ((message as any).user.id) {
        await prisma.user.update({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unnecessary-type-assertion
          where: { id: (message as any).user.id },
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
