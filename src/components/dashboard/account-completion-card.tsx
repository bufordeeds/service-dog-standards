"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type CompletionStep } from "@/components/ui/completion-gauge"
import { useUser } from "@/contexts/user-context"
import { api } from "@/utils/api"
import { toast } from "@/hooks/use-toast"
import { 
  User, 
  Camera, 
  Mail, 
  FileText, 
  Phone,
  Settings,
  Award
} from "lucide-react"

interface AccountCompletionCardProps {
  className?: string
}

export function AccountCompletionCard({ className }: AccountCompletionCardProps) {
  const userContext = useUser()
  const { data: profile } = api.auth.getProfile.useQuery(undefined, {
    enabled: userContext.isAuthenticated
  })

  // Calculate completion steps based on real user data
  const getCompletionSteps = (): CompletionStep[] => {
    if (!userContext.user || !profile) return []

    const steps: CompletionStep[] = [
      {
        id: "basic-info",
        title: "Basic Profile Information",
        description: "Add your name and basic details",
        completed: !!(profile.firstName && profile.lastName && profile.email),
        onClick: () => handleStepClick("/profile/edit", "Complete your basic profile information")
      },
      {
        id: "profile-photo",
        title: "Profile Photo",
        description: "Upload a profile picture",
        completed: !!profile.profileImage,
        onClick: () => handleStepClick("/profile/photo", "Upload your profile photo")
      },
      {
        id: "contact-info",
        title: "Contact Information",
        description: "Add phone number and address",
        completed: !!(profile.phone && profile.address),
        onClick: () => handleStepClick("/profile/contact", "Complete your contact information")
      },
      {
        id: "email-verification",
        title: "Email Verification",
        description: "Verify your email address",
        completed: !!profile.emailVerified,
        onClick: () => handleStepClick("/profile/verify", "Verify your email address")
      },
      {
        id: "agreement",
        title: "SDS Agreement",
        description: "Accept training standards agreement",
        completed: profile.agreements?.some(
          agreement => agreement.type === "TRAINING_BEHAVIOR_STANDARDS" && agreement.isActive
        ) ?? false,
        onClick: () => handleStepClick("/dashboard", "Accept the SDS Training Standards agreement")
      }
    ]

    return steps
  }

  const handleStepClick = (href: string, description: string) => {
    toast({
      title: "Action Required",
      description: description,
    })
    // TODO: Navigate to the appropriate page
    // For now, just show a toast
  }

  const completionSteps = getCompletionSteps()
  const completedCount = completionSteps.filter(step => step.completed).length
  const totalSteps = completionSteps.length
  const percentage = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0

  const getStatusColor = () => {
    if (percentage >= 100) return "text-green-600"
    if (percentage >= 75) return "text-blue-600"
    if (percentage >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusMessage = () => {
    if (percentage >= 100) return "Profile Complete!"
    if (percentage >= 75) return "Almost there!"
    if (percentage >= 50) return "Good progress"
    return "Let's get started"
  }

  const getNextActions = () => {
    const incompleteSteps = completionSteps.filter(step => !step.completed)
    return incompleteSteps.slice(0, 2) // Show next 2 actions
  }

  if (!userContext.isAuthenticated || !userContext.user) {
    return null
  }

  return (
    <Card className={`sds-pod ${className || ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-sds-primary" />
            <CardTitle>Account Setup</CardTitle>
          </div>
          <div className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </div>
        </div>
        <CardDescription>
          Complete your profile to unlock all SDS features
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Circular Progress Gauge */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted-foreground/20"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
                  className={`transition-all duration-1000 ease-out ${getStatusColor()}`}
                />
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold">
                  {percentage}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {completedCount}/{totalSteps}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="text-center space-y-2">
          <h4 className="font-medium">
            {completedCount} of {totalSteps} steps completed
          </h4>
          <p className="text-sm text-muted-foreground">
            {percentage >= 100 
              ? "You have full access to all SDS features!"
              : `${totalSteps - completedCount} steps remaining to complete your profile`
            }
          </p>
        </div>

        {/* Next Actions */}
        {percentage < 100 && (
          <div className="space-y-3">
            <h5 className="font-medium text-sm">Next Steps:</h5>
            <div className="space-y-2">
              {getNextActions().map((step) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => step.onClick?.()}
                >
                  <div className="flex-shrink-0">
                    {step.id === "basic-info" && <User className="h-4 w-4 text-muted-foreground" />}
                    {step.id === "profile-photo" && <Camera className="h-4 w-4 text-muted-foreground" />}
                    {step.id === "contact-info" && <Phone className="h-4 w-4 text-muted-foreground" />}
                    {step.id === "email-verification" && <Mail className="h-4 w-4 text-muted-foreground" />}
                    {step.id === "agreement" && <FileText className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0">
                    Start
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete State */}
        {percentage >= 100 && (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <Award className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-medium mb-2">Profile Complete!</p>
            <p className="text-sm text-green-700 mb-3">
              You now have full access to all SDS features and services.
            </p>
            <Button size="sm" variant="outline" className="bg-white">
              <Settings className="h-4 w-4 mr-2" />
              Manage Profile
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => toast({ title: "Feature Coming Soon", description: "Profile editing will be available soon." })}
            >
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => toast({ title: "Feature Coming Soon", description: "Settings page will be available soon." })}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}