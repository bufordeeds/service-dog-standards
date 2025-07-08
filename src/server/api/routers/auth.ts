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

      const profileComplete = calculateProfileCompletion({
        ...user,
        role: user.role
      });

      return {
        ...user,
        profileComplete,
      };
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(profileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // Extract city and state to build address object
      const { city, state, ...updateData } = input;
      
      // Build address object if city or state are provided
      const addressData: Record<string, unknown> | undefined = (city !== undefined || state !== undefined) ? {
        ...(typeof updateData.address === 'object' && updateData.address !== null ? updateData.address as Record<string, unknown> : {}),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
      } : updateData.address;

      const user = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...updateData,
          ...(addressData !== undefined && { address: addressData }),
        },
        include: {
          agreements: true,
        },
      });

      const profileComplete = calculateProfileCompletion({
        ...user,
        role: user.role
      });

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

  // Get public profile by user ID
  getPublicProfile: protectedProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const { userId } = input;
      
      // Check if it's the user's own profile
      if (userId === ctx.session.user.id) {
        // Return full profile for own profile
        return ctx.prisma.user.findUnique({
          where: { id: userId },
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
      }

      // For other users, check privacy settings and return limited info
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          accountType: true,
          memberNumber: true,
          profileImage: true,
          bio: true,
          city: true,
          state: true,
          website: true,
          title: true,
          createdAt: true,
          publicProfile: true,
          publicEmail: true,
          publicPhone: true,
          phone: true, // Only included if publicPhone is true
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Return limited profile data based on privacy settings
      return {
        ...user,
        email: user.publicEmail ? user.email : undefined,
        phone: user.publicPhone ? user.phone : undefined,
      };
    }),

  // Get trainers directory
  getTrainers: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      state: z.string().optional(),
      specialty: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { search, state } = input;

      interface WhereClause {
        role: string;
        publicProfile: boolean;
        OR?: Array<{
          firstName?: { contains: string; mode: 'insensitive' };
          lastName?: { contains: string; mode: 'insensitive' };
          businessName?: { contains: string; mode: 'insensitive' };
        }>;
        state?: string;
      }

      const whereClause: WhereClause = {
        role: "TRAINER",
        publicProfile: true,
      };

      // Add search filters
      if (search) {
        whereClause.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { businessName: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (state) {
        whereClause.state = state;
      }

      // Note: specialty filtering would require a separate specialties table
      // For now, we'll return all trainers and filter client-side if needed

      const trainers = await ctx.prisma.user.findMany({
        where: whereClause as Record<string, unknown>,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          bio: true,
          city: true,
          state: true,
          website: true,
          memberNumber: true,
          publicEmail: true,
          publicPhone: true,
          email: true,
          phone: true,
          createdAt: true,
          // Trainer-specific fields (would need to be added to schema)
          businessName: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return trainers.map(trainer => ({
        ...trainer,
        email: trainer.publicEmail ? trainer.email : undefined,
        phone: trainer.publicPhone ? trainer.phone : undefined,
        // Mock trainer-specific data until schema is updated
        specialties: ["Service Dogs", "Behavioral Issues", "Public Access Training"],
        yearsExperience: 10,
        rating: 4.8,
        reviewCount: 45,
        isVerified: true,
      }));
    }),
});