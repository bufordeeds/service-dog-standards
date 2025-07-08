"use client"

import * as React from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { PawPrint } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginContent() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        // Check if login was successful by getting the session
        const session = await getSession()
        if (session) {
          router.push(callbackUrl)
          router.refresh()
        } else {
          setError("Login failed. Please try again.")
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: demoEmail,
        password: demoPassword,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        // Check if login was successful by getting the session
        const session = await getSession()
        if (session) {
          router.push(callbackUrl)
          router.refresh()
        } else {
          setError("Login failed. Please try again.")
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sds-purple-50 to-sds-teal-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-sds-brand rounded-lg flex items-center justify-center">
            <PawPrint className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your Service Dog Standards account
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive text-center p-3 bg-destructive/10 rounded-lg">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full sds-btn-primary" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          {/* Test Accounts Info */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Demo Accounts:</h4>
            <div className="text-xs space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start p-2 h-auto text-xs"
                onClick={() => void handleDemoLogin("superadmin@servicedogstandards.com", "SuperAdmin123!")}
                disabled={isLoading}
              >
                <div className="text-left">
                  <div><strong>Super Admin:</strong> superadmin@servicedogstandards.com</div>
                  <div className="text-muted-foreground">Click to login</div>
                </div>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start p-2 h-auto text-xs"
                onClick={() => void handleDemoLogin("admin@servicedogstandards.com", "Admin123!")}
                disabled={isLoading}
              >
                <div className="text-left">
                  <div><strong>Admin:</strong> admin@servicedogstandards.com</div>
                  <div className="text-muted-foreground">Click to login</div>
                </div>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start p-2 h-auto text-xs"
                onClick={() => void handleDemoLogin("trainer@example.com", "Trainer123!")}
                disabled={isLoading}
              >
                <div className="text-left">
                  <div><strong>Trainer:</strong> trainer@example.com</div>
                  <div className="text-muted-foreground">Click to login</div>
                </div>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start p-2 h-auto text-xs"
                onClick={() => void handleDemoLogin("handler@example.com", "Handler123!")}
                disabled={isLoading}
              >
                <div className="text-left">
                  <div><strong>Handler:</strong> handler@example.com</div>
                  <div className="text-muted-foreground">Click to login</div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}