"use client"

import * as React from "react"
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper"
import { DashboardPageHeader } from "@/components/layout/dashboard-page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  UserPlus, 
  MessageSquare, 
  Calendar,
  PawPrint,
  Phone,
  Mail,
  MapPin
} from "lucide-react"

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic'

export default function ClientsPage() {
  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Clients" },
  ]

  const clients = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "+1 (555) 123-4567",
      location: "Seattle, WA",
      status: "active" as const,
      dogs: [
        { name: "Max", status: "in-training" as const },
        { name: "Luna", status: "fully-trained" as const }
      ],
      joinDate: "2024-01-15",
      lastContact: "2 days ago"
    },
    {
      id: "2", 
      name: "Michael Chen",
      email: "m.chen@email.com",
      phone: "+1 (555) 987-6543",
      location: "Portland, OR",
      status: "pending" as const,
      dogs: [
        { name: "Buddy", status: "in-training" as const }
      ],
      joinDate: "2024-02-20",
      lastContact: "1 week ago"
    },
    {
      id: "3",
      name: "Emma Davis",
      email: "emma.davis@email.com", 
      phone: "+1 (555) 456-7890",
      location: "Vancouver, BC",
      status: "active" as const,
      dogs: [
        { name: "Charlie", status: "fully-trained" as const },
        { name: "Bella", status: "in-training" as const }
      ],
      joinDate: "2023-11-08",
      lastContact: "3 days ago"
    }
  ]

  const stats = [
    {
      title: "Active Clients",
      value: clients.filter(c => c.status === "active").length.toString(),
      icon: UserPlus,
      color: "text-sds-success"
    },
    {
      title: "Dogs in Training", 
      value: clients.flatMap(c => c.dogs).filter(d => d.status === "in-training").length.toString(),
      icon: PawPrint,
      color: "text-sds-warning"
    },
    {
      title: "Completed Training",
      value: clients.flatMap(c => c.dogs).filter(d => d.status === "fully-trained").length.toString(),
      icon: PawPrint,
      color: "text-sds-accent"
    }
  ]

  return (
    <DashboardWrapper requiredRole={["TRAINER", "AIDE"]}>
      <div className="space-y-6">
        <DashboardPageHeader
          title="Client Management"
          description="Manage your training clients and their service dogs."
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex gap-2">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Training
              </Button>
              <Button className="sds-btn-primary">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </div>
          }
        />

        {/* Stats */}
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
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Client List */}
        <Card className="sds-pod">
          <CardHeader>
            <CardTitle>Your Clients</CardTitle>
            <CardDescription>
              Manage your training relationships and track progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clients.map((client) => (
                <div 
                  key={client.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" alt={client.name} />
                      <AvatarFallback className="bg-sds-brand text-white">
                        {client.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{client.name}</h3>
                        <StatusBadge variant={client.status} size="sm">
                          {client.status}
                        </StatusBadge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {client.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Dogs:</span>
                        {client.dogs.map((dog, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <span className="text-xs font-medium">{dog.name}</span>
                            <StatusBadge variant={dog.status} size="sm">
                              {dog.status.replace("-", " ")}
                            </StatusBadge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardWrapper>
  )
}