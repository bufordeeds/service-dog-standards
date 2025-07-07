import { z } from "zod";

// Dog registration schema
export const dogRegistrationSchema = z.object({
  name: z.string().min(1, "Dog name is required"),
  breed: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "MALE_NEUTERED", "FEMALE_SPAYED"]).optional(),
  weight: z.number().min(1, "Weight must be greater than 0").optional(),
  color: z.string().optional(),
  microchipId: z.string().optional(),
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional(),
  profileImage: z.string().url("Invalid image URL").optional(),
  trainingStartDate: z.string().optional(),
  trainingEndDate: z.string().optional(),
  trainingNotes: z.string().max(2000, "Training notes must be less than 2000 characters").optional(),
  publicProfile: z.boolean().default(true),
  showInDirectory: z.boolean().default(true),
});

// Dog status update schema
export const dogStatusUpdateSchema = z.object({
  dogId: z.string().min(1, "Dog ID is required"),
  status: z.enum(["ACTIVE", "IN_TRAINING", "RETIRED", "WASHED_OUT", "IN_MEMORIAM"]),
  statusReason: z.string().optional(),
  statusDate: z.string().optional(),
});

// Dog relationship invitation schema
export const dogRelationshipInviteSchema = z.object({
  dogId: z.string().min(1, "Dog ID is required"),
  userEmail: z.string().email("Invalid email address"),
  relationship: z.enum(["HANDLER", "TRAINER", "AIDE", "EMERGENCY_CONTACT"]),
  canEdit: z.boolean().default(false),
  canView: z.boolean().default(true),
  canOrder: z.boolean().default(false),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

// Dog achievement schema
export const dogAchievementSchema = z.object({
  dogId: z.string().min(1, "Dog ID is required"),
  title: z.string().min(1, "Achievement title is required"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  type: z.enum(["TRAINING", "CERTIFICATION", "AWARD", "MILESTONE"]),
  achievedAt: z.string().min(1, "Achievement date is required"),
  expiresAt: z.string().optional(),
  issuer: z.string().optional(),
  certificateNumber: z.string().optional(),
});

// Dog document upload schema
export const dogDocumentSchema = z.object({
  dogId: z.string().min(1, "Dog ID is required"),
  title: z.string().min(1, "Document title is required"),
  type: z.enum(["CERTIFICATE", "TRAINING_RECORD", "HEALTH_RECORD", "INSURANCE", "OTHER"]),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  isPublic: z.boolean().default(false),
  expiresAt: z.string().optional(),
  fileUrl: z.string().url("Invalid file URL"),
  fileName: z.string().min(1, "File name is required"),
  fileSize: z.number().min(1, "File size is required"),
  mimeType: z.string().min(1, "File type is required"),
});

// Dog search/filter schema
export const dogSearchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(["ACTIVE", "IN_TRAINING", "RETIRED", "WASHED_OUT", "IN_MEMORIAM"]).optional(),
  breed: z.string().optional(),
  location: z.string().optional(),
  radius: z.number().min(1).max(500).optional(), // Miles
  ownerId: z.string().optional(),
  trainerId: z.string().optional(),
  sortBy: z.enum(["name", "registrationDate", "status", "breed"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Types derived from schemas
export type DogRegistrationInput = z.infer<typeof dogRegistrationSchema>;
export type DogStatusUpdateInput = z.infer<typeof dogStatusUpdateSchema>;
export type DogRelationshipInviteInput = z.infer<typeof dogRelationshipInviteSchema>;
export type DogAchievementInput = z.infer<typeof dogAchievementSchema>;
export type DogDocumentInput = z.infer<typeof dogDocumentSchema>;
export type DogSearchInput = z.infer<typeof dogSearchSchema>;