"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { DashboardLayout } from "./dashboard-layout"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface DashboardWrapperProps {
  children: React.ReactNode
  requiredRole?: string[]
}

export function DashboardWrapper({ children, requiredRole }: DashboardWrapperProps) {
  const { data: session, status } = useSession()

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading dashboard..." />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    redirect("/auth/login")
  }

  // Check role permissions
  if (requiredRole && session?.user?.role) {
    if (!requiredRole.includes(session.user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
            <p className="text-muted-foreground">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        </div>
      )
    }
  }

  return (
    <DashboardLayout user={session?.user}>
      {children}
    </DashboardLayout>
  )
}