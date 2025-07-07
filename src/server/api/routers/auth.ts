import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import { 
  registerSchema, 
  passwordResetRequestSchema, 
  passwordResetSchema,
  emailVerificationSchema,
  profileUpdateSchema
} from "~/lib/validations/auth";
import { 
  hashPassword, 
  generateMemberNumber, 
  calculateProfileCompletion 
} from "~/lib/auth";
import { randomBytes } from "crypto";

export const authRouter = createTRPCRouter({
  // User registration
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password, firstName, lastName, role, accountType } = input;

      // Check if user already exists
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Get or create default organization
      let organization = await ctx.prisma.organization.findFirst({
        where: { subdomain: "sds" },
      });

      if (!organization) {
        organization = await ctx.prisma.organization.create({
          data: {
            name: "Service Dog Standards",
            subdomain: "sds",
            theme: {
              primary: "#3b82f6",
              secondary: "#1e40af",
              accent: "#10b981",
            },
            settings: {
              allowRegistration: true,
              requireEmailVerification: true,
            },
          },
        });
      }

      // Hash password and generate member number
      const hashedPassword = await hashPassword(password);
      const memberNumber = generateMemberNumber();

      // Create user
      const user = await ctx.prisma.user.create({
        data: {
          email,
          hashedPassword,
          firstName,
          lastName,
          role,
          accountType,
          memberNumber,
          organizationId: organization.id,
          profileComplete: 25, // Basic info completed
        },
      });

      // Generate verification token
      const verificationToken = randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

      await ctx.prisma.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires,
        },
      });

      // TODO: Send verification email

      return {
        success: true,
        message: "Registration successful. Please check your email for verification link.",
        userId: user.id,
      };
    }),

  // Email verification
  verifyEmail: publicProcedure
    .input(emailVerificationSchema)
    .mutation(async ({ ctx, input }) => {
      const { token } = input;

      const verificationToken = await ctx.prisma.verificationToken.findUnique({
        where: { token },
      });

      if (!verificationToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid verification token",
        });
      }

      if (verificationToken.expires < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Verification token has expired",
        });
      }

      // Update user as verified
      await ctx.prisma.user.update({
        where: { email: verificationToken.identifier },
        data: { emailVerified: new Date() },
      });

      // Delete used token
      await ctx.prisma.verificationToken.delete({
        where: { token },
      });

      return {
        success: true,
        message: "Email verified successfully",
      };
    }),

  // Password reset request
  requestPasswordReset: publicProcedure
    .input(passwordResetRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { email } = input;

      const user = await ctx.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Don't reveal if user exists or not
        return {
          success: true,
          message: "If an account with that email exists, you will receive a password reset link.",
        };
      }

      // Generate reset token
      const resetToken = randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      // Delete existing tokens for this email
      await ctx.prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });

      // Create new reset token
      await ctx.prisma.verificationToken.create({
        data: {
          identifier: email,
          token: resetToken,
          expires,
        },
      });

      // TODO: Send password reset email

      return {
        success: true,
        message: "If an account with that email exists, you will receive a password reset link.",
      };
    }),

  // Password reset
  resetPassword: publicProcedure
    .input(passwordResetSchema)
    .mutation(async ({ ctx, input }) => {
      const { token, password } = input;

      const resetToken = await ctx.prisma.verificationToken.findUnique({
        where: { token },
      });

      if (!resetToken) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invalid reset token",
        });
      }

      if (resetToken.expires < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reset token has expired",
        });
      }

      // Hash new password
      const hashedPassword = await hashPassword(password);

      // Update user password
      await ctx.prisma.user.update({
        where: { email: resetToken.identifier },
        data: { hashedPassword },
      });

      // Delete used token
      await ctx.prisma.verificationToken.delete({
        where: { token },
      });

      return {
        success: true,
        message: "Password reset successfully",
      };
    }),

  // Get current user profile
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          organization: true,
          agreements: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
          },
          ownedDogs: {
            select: {
              id: true,
              name: true,
              registrationNum: true,
              status: true,
              profileImage: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const profileComplete = calculateProfileCompletion(user);

      return {
        ...user,
        profileComplete,
      };
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(profileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        include: {
          agreements: true,
        },
      });

      const profileComplete = calculateProfileCompletion(user);

      // Update profile completion percentage
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { profileComplete },
      });

      return {
        success: true,
        message: "Profile updated successfully",
        profileComplete,
      };
    }),

  // Accept agreement
  acceptAgreement: protectedProcedure
    .input(z.object({
      type: z.enum(["TRAINING_BEHAVIOR_STANDARDS", "TERMS_OF_SERVICE", "PRIVACY_POLICY", "TRAINER_AGREEMENT"]),
      version: z.string(),
      content: z.record(z.unknown()),
    }))
    .mutation(async ({ ctx, input }) => {
      const { type, version, content } = input;

      // Deactivate any existing agreements of this type
      await ctx.prisma.agreement.updateMany({
        where: {
          userId: ctx.session.user.id,
          type,
          isActive: true,
        },
        data: { isActive: false },
      });

      // Create new agreement
      const expiresAt = type === "TRAINING_BEHAVIOR_STANDARDS" 
        ? new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000) // 4 years
        : undefined;

      await ctx.prisma.agreement.create({
        data: {
          userId: ctx.session.user.id,
          type,
          version,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          content: content as any, // Prisma JSON type
          acceptedAt: new Date(),
          expiresAt,
          isActive: true,
        },
      });

      return {
        success: true,
        message: "Agreement accepted successfully",
      };
    }),

  // Get organization info
  getOrganization: protectedProcedure
    .query(async ({ ctx }) => {
      const organization = await ctx.prisma.organization.findUnique({
        where: { id: ctx.session.user.organizationId },
      });

      if (!organization) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      return organization;
    }),
});