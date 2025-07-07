"use client"

import * as React from "react"
import { useAccessControl } from "@/hooks/use-access-control"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
  fallback?: React.ReactNode
  showLoadingSpinner?: boolean
}

export function ProtectedRoute({ 
  children, 
  requiredRole = [], 
  fallback,
  showLoadingSpinner = true 
}: ProtectedRouteProps) {
  const { hasAccess, isLoading, user } = useAccessControl({ requiredRole })

  // Show loading state
  if (isLoading && showLoadingSpinner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="Checking permissions..." />
      </div>
    )
  }

  // Show access denied
  if (hasAccess === false) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this page.
              {requiredRole.length > 0 && (
                <span className="block mt-2 text-xs">
                  Required role: {requiredRole.join(" or ")}
                </span>
              )}
              {user?.role && (
                <span className="block mt-1 text-xs">
                  Your role: {user.role.toLowerCase().replace("_", " ")}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              Please contact your administrator if you believe this is an error.
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/dashboard/settings">
                  Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render children if access is granted
  return <>{children}</>
}

// Higher-order component version
export function withProtectedRoute<T extends object>(
  Component: React.ComponentType<T>,
  options: { requiredRole?: string[] } = {}
) {
  const ProtectedComponent = (props: T) => (
    <ProtectedRoute requiredRole={options.requiredRole}>
      <Component {...props} />
    </ProtectedRoute>
  )

  ProtectedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`

  return ProtectedComponent
}