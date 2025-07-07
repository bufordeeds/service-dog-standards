"use client"

import * as React from "react"
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Save } from "lucide-react"

export default function SettingsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Settings" },
  ]

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <DashboardPageHeader
          title="Settings"
          description="Manage your account preferences and privacy settings."
          breadcrumbs={breadcrumbs}
          actions={
            <Button className="sds-btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Settings Navigation */}
          <div className="space-y-1">
            <nav className="space-y-1">
              <a
                href="#profile"
                className="sds-nav-item active"
              >
                Profile Settings
              </a>
              <a
                href="#privacy"
                className="sds-nav-item"
              >
                Privacy & Security
              </a>
              <a
                href="#notifications"
                className="sds-nav-item"
              >
                Notifications
              </a>
              <a
                href="#billing"
                className="sds-nav-item"
              >
                Billing & Subscriptions
              </a>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Settings */}
            <Card className="sds-pod">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Enter your first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Enter your last name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="Enter your phone number" />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="sds-pod">
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>
                  Control who can see your information and how it&apos;s used.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Public Profile</div>
                    <div className="text-sm text-muted-foreground">
                      Allow others to find and view your public profile
                    </div>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Show Training History</div>
                    <div className="text-sm text-muted-foreground">
                      Display your dog&apos;s training progress on public profiles
                    </div>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Contact Preferences</div>
                    <div className="text-sm text-muted-foreground">
                      Allow trainers and handlers to contact you
                    </div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="sds-pod">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about important updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive updates about your account via email
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">SMS Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Get important alerts via text message
                    </div>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Marketing Communications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive updates about new features and services
                    </div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  )
}