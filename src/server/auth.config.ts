import {
  type NextAuthConfig,
  type DefaultSession,
} from "next-auth";
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
 * Base auth configuration without database dependencies
 * This is used in middleware to avoid edge runtime issues
 */
export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  providers: [],
  callbacks: {
    async jwt({ token }) {
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.accountType = token.accountType as AccountType;
        session.user.organizationId = token.organizationId as string;
        session.user.profileComplete = token.profileComplete as number;
        session.user.memberNumber = token.memberNumber as string | undefined;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      
      return session;
    },
  },
};