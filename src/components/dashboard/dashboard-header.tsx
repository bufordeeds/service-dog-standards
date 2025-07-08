"use client"

import * as React from "react"
import { useUser } from "@/contexts/user-context"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { 
  Bell, 
  Settings, 
  User, 
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"

export function DashboardHeader() {
  const userContext = useUser()
  const { 
    user, 
    getDisplayName, 
    role, 
    profileComplete, 
    isAuthenticated,
    memberNumber,
    accountType 
  } = userContext ?? {
    user: null,
    getDisplayName: () => "User",
    role: "HANDLER" as any,
    profileComplete: false,
    isAuthenticated: false,
    memberNumber: undefined,
    accountType: "INDIVIDUAL" as any
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const getWelcomeMessage = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const getProfileStatus = () => {
    if (profileComplete >= 100) return "complete"
    if (profileComplete >= 80) return "approved" 
    if (profileComplete >= 50) return "in-training"
    return "incomplete"
  }

  const getNextSteps = () => {
    if (profileComplete < 100) {
      return [
        "Complete your profile information",
        "Upload a profile photo", 
        "Accept SDS agreements",
        "Verify your email address"
      ].slice(0, Math.max(1, Math.floor((100 - profileComplete) / 25)))
    }
    return []
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="sds-heading-1">
            {getWelcomeMessage()}, {getDisplayName()}!
          </h1>
          <div className="flex items-center gap-3">
            <StatusBadge variant={getProfileStatus()} size="sm">
              Profile {Math.round(profileComplete)}% Complete
            </StatusBadge>
            {memberNumber && (
              <span className="text-sm text-muted-foreground">
                Member #{memberNumber}
              </span>
            )}
            <span className="text-sm text-muted-foreground capitalize">
              {accountType?.toLowerCase().replace("_", " ")} · {role?.toLowerCase().replace("_", " ")}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {profileComplete < 100 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <CardTitle className="text-yellow-800">Complete Your Profile</CardTitle>
            </div>
            <CardDescription className="text-yellow-700">
              You&apos;re {Math.round(profileComplete)}% done! Complete your profile to unlock all SDS features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-yellow-700">Progress</span>
                <span className="font-medium text-yellow-800">{Math.round(profileComplete)}%</span>
              </div>
              <Progress value={profileComplete} className="h-2" />
            </div>
            
            {getNextSteps().length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-yellow-800">Next steps:</h4>
                <ul className="space-y-1 text-sm text-yellow-700">
                  {getNextSteps().map((step, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <Button className="w-full" variant="outline" asChild>
              <Link href="/profile">
                <User className="w-4 h-4 mr-2" />
                Complete Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Profile Complete Success */}
      {profileComplete >= 100 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-medium text-green-800">Profile Complete!</h4>
                <p className="text-sm text-green-700">
                  You have full access to all SDS features and services.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}