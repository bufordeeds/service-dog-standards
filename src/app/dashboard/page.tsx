"use client"

import * as React from "react"

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic'
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { AgreementCard } from "@/components/dashboard/agreement-card"
import { AccountCompletionCard } from "@/components/dashboard/account-completion-card"
import { DogsListCard } from "@/components/dashboard/dogs-list-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { Plus, PawPrint, FileText, Users, AlertCircle, UserCheck, Calendar, DollarSign, BookOpen } from "lucide-react"
import { useUser } from "@/contexts/user-context"
import { api } from "@/utils/api"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export default function DashboardPage() {
  const { isTrainer, isAdmin, isSuperAdmin } = useUser()
  
  // API calls for real data
  const { data: dashboardStats } = api.dashboard.getStats.useQuery()
  const { data: recentActivity } = api.dashboard.getRecentActivity.useQuery()
  const { data: quickActions } = api.dashboard.getQuickActions.useQuery()

  // Role-specific stats using real data
  const getStats = () => {
    if (!dashboardStats) return []
    
    if (isAdmin || isSuperAdmin) {
      return [
        {
          title: "Total Users",
          value: dashboardStats.totalUsers?.toString() ?? "0",
          change: dashboardStats.userGrowth ?? "",
          icon: Users,
          color: "text-sds-success",
        },
        {
          title: "Active Dogs",
          value: dashboardStats.totalDogs?.toString() ?? "0",
          change: dashboardStats.dogGrowth ?? "",
          icon: PawPrint,
          color: "text-sds-accent",
        },
        {
          title: "Pending Reviews",
          value: dashboardStats.pendingReviews?.toString() ?? "0",
          change: dashboardStats.pendingGrowth ?? "",
          icon: AlertCircle,
          color: "text-sds-warning",
        },
        {
          title: "Revenue",
          value: `$${dashboardStats.revenue?.toLocaleString() ?? "0"}`,
          change: dashboardStats.revenueGrowth ?? "",
          icon: DollarSign,
          color: "text-sds-primary",
        },
      ]
    }
    
    if (isTrainer) {
      return [
        {
          title: "Active Clients",
          value: dashboardStats.activeClients?.toString() ?? "0",
          change: dashboardStats.clientGrowth ?? "",
          icon: UserCheck,
          color: "text-sds-success",
        },
        {
          title: "Dogs in Training",
          value: dashboardStats.dogsInTraining?.toString() ?? "0",
          change: dashboardStats.trainingGrowth ?? "",
          icon: PawPrint,
          color: "text-sds-accent",
        },
        {
          title: "Sessions This Month",
          value: dashboardStats.sessionsThisMonth?.toString() ?? "0",
          change: dashboardStats.sessionGrowth ?? "",
          icon: Calendar,
          color: "text-sds-primary",
        },
        {
          title: "Monthly Income",
          value: `$${dashboardStats.monthlyIncome?.toLocaleString() ?? "0"}`,
          change: dashboardStats.incomeGrowth ?? "",
          icon: DollarSign,
          color: "text-sds-success",
        },
      ]
    }
    
    // Default handler stats
    return [
      {
        title: "Active Dogs",
        value: dashboardStats.activeDogs?.toString() ?? "0",
        change: dashboardStats.dogGrowth ?? "",
        icon: PawPrint,
        color: "text-sds-success",
      },
      {
        title: "Training Progress",
        value: `${dashboardStats.trainingProgress ?? 0}%`,
        change: dashboardStats.progressGrowth ?? "",
        icon: BookOpen,
        color: "text-sds-accent",
      },
      {
        title: "Team Members",
        value: dashboardStats.teamMembers?.toString() ?? "0",
        change: dashboardStats.teamGrowth ?? "",
        icon: Users,
        color: "text-sds-primary",
      },
    ]
  }

  const stats = getStats()

  // Map icon names to actual icons
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Users": return Users
      case "Settings": return FileText
      case "AlertCircle": return AlertCircle
      case "BarChart": return DollarSign
      case "UserPlus": return UserCheck
      case "Calendar": return Calendar
      case "BookOpen": return BookOpen
      case "User": return Users
      case "Plus": return Plus
      case "FileText": return FileText
      case "Heart": return PawPrint
      default: return FileText
    }
  }

  // Use API data for quick actions, fallback to empty array
  const displayQuickActions = quickActions ?? []

  // Use API data for recent activity, fallback to empty array
  const displayRecentActivity = recentActivity ?? []

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <DashboardHeader />

        {/* Quick Actions */}
        <Card className="sds-pod">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              {isAdmin || isSuperAdmin ? "Administrative tools" : isTrainer ? "Trainer tools" : "Get started with common tasks"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {displayQuickActions.map((action, index) => {
                const Icon = getIconComponent(action.icon)
                return (
                  <Button
                    key={action.title}
                    variant={index === 0 ? "default" : "outline"}
                    className={`h-16 flex-col gap-2 ${index === 0 ? "sds-btn-primary" : ""}`}
                    asChild
                  >
                    <Link href={action.href}>
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{action.title}</span>
                    </Link>
                  </Button>
                )
              })}
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
        {isAdmin || isSuperAdmin ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Admin Content */}
            <Card className="sds-pod lg:col-span-2">
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>
                  Recent registrations and system activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h3 className="font-semibold text-lg">New Users</h3>
                      <p className="text-2xl font-bold text-sds-success">12</p>
                      <p className="text-sm text-muted-foreground">This month</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h3 className="font-semibold text-lg">Dog Registrations</h3>
                      <p className="text-2xl font-bold text-sds-accent">5</p>
                      <p className="text-sm text-muted-foreground">This week</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/admin/users">View All Users</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agreement Card */}
            <AgreementCard />
          </div>
        ) : isTrainer ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Trainer Content */}
            <Card className="sds-pod lg:col-span-2">
              <CardHeader>
                <CardTitle>Client Overview</CardTitle>
                <CardDescription>
                  Your active clients and their progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h3 className="font-semibold text-lg">Active Clients</h3>
                      <p className="text-2xl font-bold text-sds-success">12</p>
                      <p className="text-sm text-muted-foreground">2 new this month</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h3 className="font-semibold text-lg">Sessions</h3>
                      <p className="text-2xl font-bold text-sds-accent">42</p>
                      <p className="text-sm text-muted-foreground">This month</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h3 className="font-semibold text-lg">Graduates</h3>
                      <p className="text-2xl font-bold text-sds-primary">3</p>
                      <p className="text-sm text-muted-foreground">Expected soon</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/trainer/clients">Manage Clients</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agreement Card */}
            <AgreementCard />

            {/* Account Completion */}
            <AccountCompletionCard />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Handler Content (Default) */}
            <DogsListCard className="lg:col-span-2" />

            {/* Agreement Card */}
            <AgreementCard />

            {/* Account Completion */}
            <AccountCompletionCard />
          </div>
        )}

        {/* Recent Activity */}
        <Card className="sds-pod">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest interactions and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayRecentActivity.length > 0 ? (
              displayRecentActivity.map((activity) => (
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
                      {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardWrapper>
  )
}