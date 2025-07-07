"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react"

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Configuration Error",
    description: "There's an issue with the authentication configuration. Please contact support.",
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You don't have permission to access this resource.",
  },
  Verification: {
    title: "Verification Error",
    description: "The verification link is invalid or has expired.",
  },
  Default: {
    title: "Authentication Error",
    description: "An error occurred during authentication. Please try again.",
  },
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "Default"
  
  const errorInfo = errorMessages[error] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sds-purple-50 to-sds-teal-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-2xl">{errorInfo.title}</CardTitle>
            <CardDescription className="mt-2">
              {errorInfo.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === "Configuration" && (
            <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
              <p><strong>Technical Details:</strong></p>
              <p>NextAuth.js configuration error. This usually happens when:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Environment variables are missing</li>
                <li>Database connection issues</li>
                <li>Provider configuration problems</li>
              </ul>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
          
          <div className="text-center">
            <Button variant="link" asChild>
              <Link href="/">
                Return to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}