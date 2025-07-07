"use client"

import * as React from "react"
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRoleAccess } from "@/hooks/use-access-control"
import { 
  Users, 
  FileText, 
  Shield, 
  BarChart3,
  Settings,
  UserCheck,
  Building,
  AlertTriangle
} from "lucide-react"

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
  const { isSuperAdmin } = useRoleAccess()

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Admin" },
  ]

  const adminStats = [
    {
      title: "Total Users",
      value: "1,247",
      change: "+12 this week",
      icon: Users,
      color: "text-sds-brand",
    },
    {
      title: "Pending Registrations",
      value: "23",
      change: "Awaiting review",
      icon: FileText,
      color: "text-sds-warning",
    },
    {
      title: "Active Organizations",
      value: "89",
      change: "+3 this month",
      icon: Building,
      color: "text-sds-accent",
    },
    {
      title: "System Alerts",
      value: "2",
      change: "Require attention",
      icon: AlertTriangle,
      color: "text-sds-error",
    },
  ]

  return (
    <DashboardWrapper requiredRole={["ADMIN", "SUPER_ADMIN"]}>
      <div className="space-y-6">
        <DashboardPageHeader
          title="Admin Dashboard"
          description="Manage users, organizations, and system settings."
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex gap-2">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
              {isSuperAdmin && (
                <Button className="sds-btn-primary">
                  <Shield className="w-4 h-4 mr-2" />
                  Super Admin Panel
                </Button>
              )}
            </div>
          }
        />

        {/* Admin Stats */}
        <div className="sds-dashboard-grid">
          {adminStats.map((stat) => {
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

        {/* Admin Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="sds-pod">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <Users className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Manage Users</div>
                    <div className="text-sm text-muted-foreground">View and edit user accounts</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <UserCheck className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Role Assignments</div>
                    <div className="text-sm text-muted-foreground">Assign and modify user roles</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <Building className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Organizations</div>
                    <div className="text-sm text-muted-foreground">Manage training organizations</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="sds-pod">
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Monitor system health and performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <BarChart3 className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Analytics</div>
                    <div className="text-sm text-muted-foreground">View system usage statistics</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <FileText className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Content Management</div>
                    <div className="text-sm text-muted-foreground">Manage agreements and documents</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <Settings className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">System Settings</div>
                    <div className="text-sm text-muted-foreground">Configure system parameters</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="sds-pod">
          <CardHeader>
            <CardTitle>Recent Admin Activity</CardTitle>
            <CardDescription>
              Latest system changes and user activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 rounded-lg border border-border">
                <Users className="h-4 w-4 text-sds-success" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-muted-foreground">John Smith - Handler role assigned</p>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg border border-border">
                <FileText className="h-4 w-4 text-sds-warning" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Registration pending review</p>
                  <p className="text-xs text-muted-foreground">Service dog application #SDS-2024-042</p>
                </div>
                <span className="text-xs text-muted-foreground">4 hours ago</span>
              </div>
              <div className="flex items-center space-x-4 p-3 rounded-lg border border-border">
                <Building className="h-4 w-4 text-sds-accent" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Organization approved</p>
                  <p className="text-xs text-muted-foreground">Canine Companions Training Center</p>
                </div>
                <span className="text-xs text-muted-foreground">1 day ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardWrapper>
  )
}