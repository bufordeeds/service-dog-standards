import bcrypt from "bcryptjs";
import { type UserRole } from "@prisma/client";
import type { Address } from "@/types/api";

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Role hierarchy for permissions
export const roleHierarchy: Record<UserRole, number> = {
  HANDLER: 0,
  TRAINER: 1,
  AIDE: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

// Permission checking
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Check if user has any of the required roles
export function hasAnyRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => hasPermission(userRole, role));
}

// Generate member number (SDS-specific format)
export function generateMemberNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SDS-${year}-${random}`;
}

// Generate dog registration number
export function generateDogRegistrationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `DOG-${year}-${random}`;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// Calculate profile completion percentage
export function calculateProfileCompletion(user: {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  profileImage?: string | null;
  address?: Address;
  bio?: string | null;
  emailVerified?: Date | null;
  role?: string;
  agreements?: Array<{ type: string; isActive: boolean }>;
}): number {
  let completed = 0;
  let total = 8;

  // Basic profile requirements for all users
  if (user.firstName) completed++;
  if (user.lastName) completed++;
  if (user.phone) completed++;
  if (user.profileImage) completed++;
  if (user.address) completed++;
  if (user.bio) completed++;
  if (user.emailVerified) completed++;

  // Agreement requirements vary by role
  if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    // Admins don't need training standards agreements
    total = 7; // Remove agreement requirement
  } else {
    // Regular users (handlers, trainers) need training standards agreement
    if (user.agreements?.some(a => a.type === 'TRAINING_BEHAVIOR_STANDARDS' && a.isActive)) completed++;
  }

  return Math.round((completed / total) * 100);
}