"use client"

import { useSession } from "next-auth/react"
import { useRoleAccess } from "./use-access-control"

export function useSessionUser() {
  const { data: session, status } = useSession()
  const roleAccess = useRoleAccess()

  const user = session?.user

  return {
    // Session state
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",

    // User data
    user,
    userId: user?.id,
    email: user?.email,
    name: user?.name,
    firstName: user?.name?.split(" ")[0],
    lastName: user?.name?.split(" ").slice(1).join(" "),
    image: user?.image,
    
    // SDS-specific data
    role: user?.role,
    accountType: user?.accountType,
    organizationId: user?.organizationId,
    memberNumber: user?.memberNumber,
    profileComplete: user?.profileComplete || 0,
    emailVerified: user?.emailVerified,

    // Role checks
    ...roleAccess,

    // Helper functions
    getInitials: () => {
      if (!user?.name) return user?.email?.[0]?.toUpperCase() || "U"
      return user.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    },

    getDisplayName: () => {
      return user?.name || user?.email || "User"
    },

    isProfileComplete: () => {
      return (user?.profileComplete || 0) >= 100
    },

    needsProfileCompletion: () => {
      return (user?.profileComplete || 0) < 80
    },

    canAccessRoute: (requiredRoles: string[]) => {
      if (!user?.role) return false
      if (requiredRoles.length === 0) return true
      return requiredRoles.includes(user.role)
    },
  }
}