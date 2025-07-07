import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { loginSchema } from "~/lib/validations/auth";
import { verifyPassword, calculateProfileCompletion } from "~/lib/auth";
import type { UserRole, AccountType } from "@prisma/client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      accountType: AccountType;
      organizationId: string;
      profileComplete: number;
      memberNumber?: string;
      emailVerified?: Date | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    accountType: AccountType;
    organizationId: string;
    profileComplete: number;
    memberNumber?: string;
    emailVerified?: Date | null;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
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
        const profileComplete = calculateProfileCompletion(user);

        return {
          id: user.id,
          email: user.email,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
          image: user.profileImage,
          role: user.role,
          accountType: user.accountType,
          organizationId: user.organizationId,
          profileComplete,
          memberNumber: user.memberNumber,
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
    async signIn({ user, account, profile }) {
      // Handle OAuth account linking and email verification
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
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
    async session({ session, user }) {
      if (session.user && user) {
        // Get fresh user data with relations
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { 
            organization: true,
            agreements: true
          }
        });

        if (dbUser) {
          const profileComplete = calculateProfileCompletion(dbUser);

          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.accountType = dbUser.accountType;
          session.user.organizationId = dbUser.organizationId;
          session.user.profileComplete = profileComplete;
          session.user.memberNumber = dbUser.memberNumber;
          session.user.emailVerified = dbUser.emailVerified;
        }
      }
      
      return session;
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

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx?: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  if (ctx) {
    return getServerSession(ctx.req, ctx.res, authOptions);
  }
  return getServerSession(authOptions);
};
