"use client"

import * as React from "react"
import { StatusBadge } from "./status-badge"
import { LoadingSpinner } from "./loading-spinner"
import { CompletionGauge } from "./completion-gauge"
import { Button } from "./button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"

export function SDSThemeDemo() {
  const demoSteps = [
    { id: "1", title: "Profile Setup", completed: true, description: "Complete your basic profile information" },
    { id: "2", title: "Photo Upload", completed: true, description: "Add a profile photo" },
    { id: "3", title: "Agreement", completed: false, description: "Accept SDS Training Standards" },
    { id: "4", title: "Registration", completed: false, description: "Complete account registration" },
  ]

  return (
    <div className="sds-container sds-section space-y-8">
      <div className="text-center space-y-4">
        <h1 className="sds-heading-1">SDS Theme Demo</h1>
        <p className="sds-body max-w-2xl mx-auto">
          This demonstrates the Service Dog Standards design system with brand colors, 
          typography, and component styling.
        </p>
      </div>

      {/* Color Palette */}
      <div className="sds-pod">
        <div className="sds-pod-header">
          <h2 className="sds-heading-2">Brand Colors</h2>
          <p className="sds-caption">SDS brand color palette and usage</p>
        </div>
        <div className="sds-pod-content">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-full h-16 bg-sds-brand rounded-lg border"></div>
              <p className="text-xs text-center">Brand Purple</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-sds-accent rounded-lg border"></div>
              <p className="text-xs text-center">Accent Teal</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-sds-success rounded-lg border"></div>
              <p className="text-xs text-center">Success Green</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-sds-error rounded-lg border"></div>
              <p className="text-xs text-center">Error Red</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="sds-pod">
        <div className="sds-pod-header">
          <h2 className="sds-heading-2">Status Badges</h2>
          <p className="sds-caption">Various status indicators used throughout the app</p>
        </div>
        <div className="sds-pod-content">
          <div className="flex flex-wrap gap-3">
            <StatusBadge variant="approved">Approved</StatusBadge>
            <StatusBadge variant="pending">Pending Review</StatusBadge>
            <StatusBadge variant="in-training">In Training</StatusBadge>
            <StatusBadge variant="active">Active</StatusBadge>
            <StatusBadge variant="rejected">Rejected</StatusBadge>
            <StatusBadge variant="expired">Expired</StatusBadge>
            <StatusBadge variant="complete">Complete</StatusBadge>
            <StatusBadge variant="incomplete">Incomplete</StatusBadge>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="sds-pod">
        <div className="sds-pod-header">
          <h2 className="sds-heading-2">Button Styles</h2>
          <p className="sds-caption">Primary and secondary button variants</p>
        </div>
        <div className="sds-pod-content">
          <div className="flex flex-wrap gap-4">
            <Button className="sds-btn-primary">Primary Button</Button>
            <Button className="sds-btn-secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button disabled>
              <LoadingSpinner size="sm" className="mr-2" />
              Loading...
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid Demo */}
      <div className="space-y-4">
        <h2 className="sds-heading-2">Dashboard Pod Layout</h2>
        <div className="sds-dashboard-grid">
          <Card className="sds-pod">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-sds-success rounded-full"></div>
                Active Dogs
              </CardTitle>
              <CardDescription>Currently registered service dogs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-sds-brand">24</div>
              <p className="text-sm text-muted-foreground">+2 this month</p>
            </CardContent>
          </Card>

          <Card className="sds-pod">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-sds-warning rounded-full"></div>
                Pending Reviews
              </CardTitle>
              <CardDescription>Applications awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-sds-warning">8</div>
              <p className="text-sm text-muted-foreground">Avg. 3 days to review</p>
            </CardContent>
          </Card>

          <Card className="sds-pod">
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <CompletionGauge
                steps={demoSteps}
                variant="circular"
                size="sm"
                showSteps={false}
              />
            </CardContent>
          </Card>

          <Card className="sds-pod">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-sds-accent rounded-full"></div>
                Active Trainers
              </CardTitle>
              <CardDescription>Certified trainers in network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-sds-accent">156</div>
              <p className="text-sm text-muted-foreground">Across 12 states</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Completion Gauge Demo */}
      <div className="sds-pod">
        <div className="sds-pod-header">
          <h2 className="sds-heading-2">Profile Completion</h2>
          <p className="sds-caption">Interactive step-by-step completion tracking</p>
        </div>
        <div className="sds-pod-content">
          <CompletionGauge
            steps={demoSteps}
            title="Complete Your Profile"
            description="Finish these steps to activate your SDS account"
            variant="circular"
            size="md"
          />
        </div>
      </div>
    </div>
  )
}