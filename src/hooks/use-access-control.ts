"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AccessControlOptions {
  requiredRole?: string[]
  redirectTo?: string
  fallbackComponent?: React.ComponentType
}

export function useAccessControl(options: AccessControlOptions = {}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { requiredRole = [], redirectTo = "/dashboard" } = options

  const hasAccess = () => {
    if (status === "loading") return null // Still loading
    if (status === "unauthenticated") return false // Not authenticated
    if (requiredRole.length === 0) return true // No specific role required
    if (!session?.user?.role) return false // No role assigned
    return requiredRole.includes(session.user.role)
  }

  const access = hasAccess()

  useEffect(() => {
    if (status === "loading") return // Don't redirect while loading

    if (status === "unauthenticated") {
      router.push("/auth/login")
      return
    }

    if (access === false && session) {
      router.push(redirectTo)
      return
    }
  }, [status, access, session, router, redirectTo])

  return {
    hasAccess: access,
    isLoading: status === "loading",
    user: session?.user,
    session,
  }
}

// Role hierarchy for permission checking
export const roleHierarchy: Record<string, number> = {
  HANDLER: 0,
  TRAINER: 1,
  AIDE: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = roleHierarchy[userRole] ?? -1
  const requiredLevel = roleHierarchy[requiredRole] ?? 0
  return userLevel >= requiredLevel
}

export function hasAnyRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole)
}

// Helper hook for role-based UI rendering
export function useRoleAccess() {
  const { data: session } = useSession()
  const userRole = session?.user?.role

  return {
    isHandler: userRole === "HANDLER",
    isTrainer: userRole === "TRAINER",
    isAide: userRole === "AIDE",
    isAdmin: userRole === "ADMIN",
    isSuperAdmin: userRole === "SUPER_ADMIN",
    hasPermission: (requiredRole: string) => 
      userRole ? hasPermission(userRole, requiredRole) : false,
    hasAnyRole: (allowedRoles: string[]) =>
      userRole ? hasAnyRole(userRole, allowedRoles) : false,
    role: userRole,
  }
}