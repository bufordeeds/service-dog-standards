import { z } from "zod";

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Registration validation schema
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["HANDLER", "TRAINER", "AIDE"], {
    required_error: "Please select your role",
  }),
  accountType: z.enum(["INDIVIDUAL", "PROFESSIONAL", "ORGANIZATION"]).default("INDIVIDUAL"),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Email verification schema
export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  profileImage: z.string().optional(),
  title: z.string().optional(),
  
  // Privacy settings
  publicProfile: z.boolean().optional(),
  publicEmail: z.boolean().optional(),
  publicPhone: z.boolean().optional(),
  showInDirectory: z.boolean().optional(),
  allowMessages: z.boolean().optional(),
  
  // Notification preferences
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  agreementReminders: z.boolean().optional(),
  trainingUpdates: z.boolean().optional(),
  systemAnnouncements: z.boolean().optional(),
});

// Address schema (for profile and shipping)
export const addressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  country: z.string().min(2, "Country is required").default("US"),
});

// Trainer profile schema
export const trainerProfileSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessLicense: z.string().optional(),
  specialties: z.array(z.string()).min(1, "At least one specialty is required"),
  insuranceInfo: z.object({
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
    expirationDate: z.string().optional(),
  }).optional(),
});

// Types derived from schemas
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type TrainerProfileInput = z.infer<typeof trainerProfileSchema>;