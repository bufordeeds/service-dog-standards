"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/utils/api"
import { 
  Dog,
  Plus,
  Eye,
  Edit,
  ShoppingCart,
  MoreVertical,
  Calendar,
  Users,
  Award
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface DogsListCardProps {
  className?: string
}

interface DogCardProps {
  dog: {
    id: string
    registrationNum: string
    name: string
    breed?: string | null
    status: "ACTIVE" | "IN_TRAINING" | "RETIRED" | "WASHED_OUT" | "IN_MEMORIAM"
    profileImage?: string | null
    createdAt: Date
    teamMembers: Array<{
      id: string
      name: string
      role: string
      relationship: string
    }>
    recentAchievements: Array<{
      id: string
      title: string
      earnedAt: Date
    }>
  }
}

function DogCard({ dog }: DogCardProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "approved"
      case "IN_TRAINING":
        return "in-training"
      case "RETIRED":
        return "inactive"
      case "WASHED_OUT":
        return "failed"
      case "IN_MEMORIAM":
        return "expired"
      default:
        return "default"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Active Service Dog"
      case "IN_TRAINING":
        return "In Training"
      case "RETIRED":
        return "Retired"
      case "WASHED_OUT":
        return "Washed Out"
      case "IN_MEMORIAM":
        return "In Memoriam"
      default:
        return status
    }
  }

  return (
    <div className="group relative rounded-xl border bg-card p-6 transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <Avatar className="h-16 w-16 border-2 border-muted">
            <AvatarImage src={dog.profileImage || undefined} alt={dog.name} />
            <AvatarFallback className="bg-sds-purple-50 text-sds-purple-600">
              <Dog className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{dog.name}</h3>
            <p className="text-sm text-muted-foreground">
              {dog.breed || "Mixed Breed"} • #{dog.registrationNum}
            </p>
            <StatusBadge variant={getStatusVariant(dog.status)}>
              {getStatusLabel(dog.status)}
            </StatusBadge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/dogs/${dog.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/dogs/${dog.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Info
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/dogs/${dog.id}/materials`}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Order Materials
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Since {format(new Date(dog.createdAt), "MMM yyyy")}</span>
        </div>
        {dog.teamMembers.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{dog.teamMembers.length} team member{dog.teamMembers.length > 1 ? 's' : ''}</span>
          </div>
        )}
        {dog.recentAchievements.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Award className="h-4 w-4" />
            <span>{dog.recentAchievements.length} achievement{dog.recentAchievements.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/dashboard/dogs/${dog.id}`}>
            View Profile
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/dashboard/dogs/${dog.id}/edit`}>
            Quick Edit
          </Link>
        </Button>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-20 h-20 rounded-full bg-sds-purple-50 flex items-center justify-center mb-4">
        <Dog className="h-10 w-10 text-sds-purple-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No dogs registered yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        Register your service dog to access training resources, materials, and connect with trainers.
      </p>
      <Button asChild className="sds-btn-primary">
        <Link href="/dashboard/dogs/register">
          <Plus className="mr-2 h-4 w-4" />
          Register Your First Dog
        </Link>
      </Button>
    </div>
  )
}

export function DogsListCard({ className }: DogsListCardProps) {
  const { data: dogs, isLoading } = api.dogs.getUserDogs.useQuery()
  const { data: stats } = api.dogs.getDogStats.useQuery()

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Dog className="h-5 w-5" />
            Registered Dogs
          </CardTitle>
          <CardDescription>
            Manage your service dogs and their profiles
          </CardDescription>
        </div>
        {dogs && dogs.length > 0 && (
          <Button asChild size="sm" className="sds-btn-primary">
            <Link href="/dashboard/dogs/register">
              <Plus className="mr-2 h-4 w-4" />
              Add Dog
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : dogs && dogs.length > 0 ? (
          <>
            {stats && (
              <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 sm:grid-cols-5">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{stats.inTraining}</p>
                  <p className="text-xs text-muted-foreground">Training</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{stats.retired}</p>
                  <p className="text-xs text-muted-foreground">Retired</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{stats.washedOut + stats.inMemoriam}</p>
                  <p className="text-xs text-muted-foreground">Inactive</p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {dogs.map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  )
}