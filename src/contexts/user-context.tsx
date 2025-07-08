"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useRoleAccess } from "@/hooks/use-access-control"

interface UserContextValue {
  // Session state
  session: Record<string, unknown> | null
  status: string
  isLoading: boolean
  isAuthenticated: boolean
  
  // User data
  user: Record<string, unknown> | null
  userId?: string
  email?: string
  name?: string
  role?: string
  accountType?: string
  organizationId?: string
  memberNumber?: string
  profileComplete: number
  
  // Role checks
  isHandler: boolean
  isTrainer: boolean
  isAide: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  
  // Helper functions
  getInitials: () => string
  getDisplayName: () => string
  canAccessRoute: (requiredRoles: string[]) => boolean
  hasPermission: (requiredRole: string) => boolean
  hasAnyRole: (allowedRoles: string[]) => boolean
}

const UserContext = React.createContext<UserContextValue | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const roleAccess = useRoleAccess()
  
  const user = session?.user
  
  const value: UserContextValue = {
    // Session state
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    
    // User data
    user,
    userId: user?.id,
    email: user?.email,
    name: user?.name,
    role: user?.role,
    accountType: user?.accountType,
    organizationId: user?.organizationId,
    memberNumber: user?.memberNumber,
    profileComplete: user?.profileComplete || 0,
    
    // Role checks
    isHandler: roleAccess.isHandler,
    isTrainer: roleAccess.isTrainer,
    isAide: roleAccess.isAide,
    isAdmin: roleAccess.isAdmin,
    isSuperAdmin: roleAccess.isSuperAdmin,
    
    // Helper functions
    getInitials: () => {
      if (!user?.name) return user?.email?.[0]?.toUpperCase() || "U"
      return user.name
        .split(" ")
        .map((n: string) => n[0] ?? "")
        .join("")
        .toUpperCase()
        .slice(0, 2)
    },
    
    getDisplayName: () => {
      return user?.name || user?.email || "User"
    },
    
    canAccessRoute: (requiredRoles: string[]) => {
      if (!user?.role) return false
      if (requiredRoles.length === 0) return true
      return requiredRoles.includes(user.role)
    },
    
    hasPermission: roleAccess.hasPermission,
    hasAnyRole: roleAccess.hasAnyRole,
  }
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = React.useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

// HOC for components that need user context
export function withUser<T extends object>(
  Component: React.ComponentType<T>
) {
  const WrappedComponent = (props: T) => (
    <UserProvider>
      <Component {...props} />
    </UserProvider>
  )
  
  WrappedComponent.displayName = `withUser(${Component.displayName || Component.name})`
  
  return WrappedComponent
}