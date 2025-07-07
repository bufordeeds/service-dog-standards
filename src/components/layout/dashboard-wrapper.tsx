"use client"

import * as React from "react"
import { DashboardLayout } from "./dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserProvider } from "@/contexts/user-context"
import { useSessionUser } from "@/hooks/use-session-user"

interface DashboardWrapperProps {
  children: React.ReactNode
  requiredRole?: string[]
}

function DashboardContent({ children, requiredRole }: DashboardWrapperProps) {
  const { user } = useSessionUser()

  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <DashboardLayout user={user}>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  )
}

export function DashboardWrapper({ children, requiredRole }: DashboardWrapperProps) {
  return (
    <UserProvider>
      <DashboardContent requiredRole={requiredRole}>
        {children}
      </DashboardContent>
    </UserProvider>
  )
}