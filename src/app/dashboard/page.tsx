"use client"

import * as React from "react"

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic'
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AgreementCard } from "@/components/dashboard/agreement-card"
import { AccountCompletionCard } from "@/components/dashboard/account-completion-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, PawPrint, FileText, Users, AlertCircle } from "lucide-react"

export default function DashboardPage() {

  const stats = [
    {
      title: "Active Dogs",
      value: "3",
      change: "+1 this month",
      icon: PawPrint,
      color: "text-sds-success",
    },
    {
      title: "Pending Applications",
      value: "1",
      change: "Awaiting review",
      icon: FileText,
      color: "text-sds-warning",
    },
    {
      title: "Training Sessions",
      value: "12",
      change: "This month",
      icon: Users,
      color: "text-sds-accent",
    },
  ]

  const recentActivity = [
    {
      id: "1",
      type: "registration",
      title: "Max's registration approved",
      description: "Service dog registration #SDS-2024-001",
      time: "2 hours ago",
      status: "approved" as const,
    },
    {
      id: "2",
      type: "training",
      title: "Training session completed",
      description: "Public access training with Luna",
      time: "1 day ago",
      status: "complete" as const,
    },
    {
      id: "3",
      type: "agreement",
      title: "Agreement renewal required",
      description: "SDS Training Standards expires in 30 days",
      time: "3 days ago",
      status: "pending" as const,
    },
  ]

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <DashboardHeader />

        {/* Quick Actions */}
        <Card className="sds-pod">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with common tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button className="sds-btn-primary h-16 flex-col gap-2">
                <Plus className="h-5 w-5" />
                <span className="text-sm">Register Dog</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-sm">View Agreements</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <Users className="h-5 w-5" />
                <span className="text-sm">Find Trainers</span>
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2">
                <PawPrint className="h-5 w-5" />
                <span className="text-sm">My Dogs</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="sds-dashboard-grid">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="sds-pod">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Agreement Card */}
          <AgreementCard />

          {/* Account Completion */}
          <AccountCompletionCard />

          {/* Recent Activity */}
          <Card className="sds-pod">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest interactions and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === "registration" && (
                      <PawPrint className="h-4 w-4 text-sds-success" />
                    )}
                    {activity.type === "training" && (
                      <Users className="h-4 w-4 text-sds-accent" />
                    )}
                    {activity.type === "agreement" && (
                      <AlertCircle className="h-4 w-4 text-sds-warning" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <StatusBadge variant={activity.status} size="sm">
                        {activity.status}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardWrapper>
  )
}