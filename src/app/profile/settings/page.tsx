"use client"

import * as React from "react"
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { api } from "@/utils/api"
// import { useUser } from "@/contexts/user-context"
import { toast } from "@/hooks/use-toast"
import { 
  Eye, 
  User, 
  Bell,
  Lock,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  Globe,
  Users
} from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ProfileSettingsPage() {
  const { data: profile, refetch } = api.auth.getProfile.useQuery()
  
  const [settings, setSettings] = React.useState({
    publicProfile: false,
    publicEmail: false,
    publicPhone: false,
    showInDirectory: false,
    allowMessages: true,
    emailNotifications: true,
    pushNotifications: false,
    agreementReminders: true,
    trainingUpdates: true,
    systemAnnouncements: true,
  })

  const updateSettingsMutation = api.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your privacy settings have been saved.",
      })
      void refetch()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  React.useEffect(() => {
    if (profile) {
      setSettings({
        publicProfile: Boolean(profile.publicProfile),
        publicEmail: false, // Default to false since field doesn't exist in API
        publicPhone: false, // Default to false since field doesn't exist in API
        showInDirectory: false, // Default to false since field doesn't exist in API
        allowMessages: true, // Default to true
        emailNotifications: true, // Default to true
        pushNotifications: false, // Default to false
        agreementReminders: true, // Default to true
        trainingUpdates: true, // Default to true
        systemAnnouncements: true, // Default to true
      })
    }
  }, [profile])

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    
    // Auto-save settings
    updateSettingsMutation.mutate(newSettings)
  }

  const getVisibilityStatus = () => {
    if (settings.publicProfile) {
      return {
        icon: Globe,
        text: "Public Profile",
        description: "Your profile is visible to all SDS members",
        variant: "default" as const,
      }
    }
    return {
      icon: Lock,
      text: "Private Profile",
      description: "Your profile is only visible to you",
      variant: "secondary" as const,
    }
  }

  const visibilityStatus = getVisibilityStatus()
  const StatusIcon = visibilityStatus.icon

  if (!profile) {
    return (
      <DashboardWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sds-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </DashboardWrapper>
    )
  }

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Privacy Settings</h1>
            <p className="text-muted-foreground">
              Manage your privacy and notification preferences
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/profile">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Link>
          </Button>
        </div>

        {/* Privacy Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sds-purple-50">
                  <StatusIcon className="h-5 w-5 text-sds-purple-600" />
                </div>
                <div>
                  <CardTitle>{visibilityStatus.text}</CardTitle>
                  <CardDescription>{visibilityStatus.description}</CardDescription>
                </div>
              </div>
              <Badge variant={visibilityStatus.variant}>
                {settings.publicProfile ? "Public" : "Private"}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Profile Visibility
            </CardTitle>
            <CardDescription>
              Control who can see your profile and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Allow other SDS members to view your profile
                </p>
              </div>
              <Switch
                checked={settings.publicProfile}
                onCheckedChange={(checked) => handleSettingChange('publicProfile', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Show in Directory</Label>
                <p className="text-sm text-muted-foreground">
                  Include your profile in member directory searches
                </p>
              </div>
              <Switch
                checked={settings.showInDirectory}
                onCheckedChange={(checked) => handleSettingChange('showInDirectory', checked)}
                disabled={!settings.publicProfile}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Public Email</Label>
                <p className="text-sm text-muted-foreground">
                  Show your email address on your public profile
                </p>
              </div>
              <Switch
                checked={settings.publicEmail}
                onCheckedChange={(checked) => handleSettingChange('publicEmail', checked)}
                disabled={!settings.publicProfile}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Public Phone</Label>
                <p className="text-sm text-muted-foreground">
                  Show your phone number on your public profile
                </p>
              </div>
              <Switch
                checked={settings.publicPhone}
                onCheckedChange={(checked) => handleSettingChange('publicPhone', checked)}
                disabled={!settings.publicProfile}
              />
            </div>
          </CardContent>
        </Card>

        {/* Communication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Communication
            </CardTitle>
            <CardDescription>
              Control how other members can contact you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Allow Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Let other members send you messages through the platform
                </p>
              </div>
              <Switch
                checked={settings.allowMessages}
                onCheckedChange={(checked) => handleSettingChange('allowMessages', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose what notifications you&apos;d like to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important updates via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Agreement Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when agreements are expiring
                </p>
              </div>
              <Switch
                checked={settings.agreementReminders}
                onCheckedChange={(checked) => handleSettingChange('agreementReminders', checked)}
                disabled={!settings.emailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Training Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your service dog&apos;s training
                </p>
              </div>
              <Switch
                checked={settings.trainingUpdates}
                onCheckedChange={(checked) => handleSettingChange('trainingUpdates', checked)}
                disabled={!settings.emailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">System Announcements</Label>
                <p className="text-sm text-muted-foreground">
                  Important platform updates and announcements
                </p>
              </div>
              <Switch
                checked={settings.systemAnnouncements}
                onCheckedChange={(checked) => handleSettingChange('systemAnnouncements', checked)}
                disabled={!settings.emailNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Account Security
            </CardTitle>
            <CardDescription>
              Manage your account security and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Change Password</Label>
                <p className="text-sm text-muted-foreground">
                  Update your account password
                </p>
              </div>
              <Button variant="outline">
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Download Data</Label>
                <p className="text-sm text-muted-foreground">
                  Export your account data and information
                </p>
              </div>
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <div className="space-y-0.5">
                <Label className="text-base font-medium text-destructive">Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Delete Account
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove your data from our servers, including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Your profile and personal information</li>
                        <li>All registered service dogs</li>
                        <li>Training records and achievements</li>
                        <li>Agreement history</li>
                        <li>Messages and communications</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
                      Yes, delete my account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardWrapper>
  )
}