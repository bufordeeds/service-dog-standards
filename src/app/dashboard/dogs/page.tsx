"use client"

import * as React from "react"
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { api } from "@/utils/api"
import Link from "next/link"
import { Plus, PawPrint, User, Award, Calendar, MapPin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function DashboardDogsPage() {
  const { data: userDogs, isPending } = api.dogs.getUserDogs.useQuery()

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0] ?? '').join('').toUpperCase().slice(0, 2)
  }

  if (isPending) {
    return (
      <DashboardWrapper>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Dogs</h1>
              <p className="text-muted-foreground">Manage your registered service dogs</p>
            </div>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sds-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your dogs...</p>
            </div>
          </div>
        </div>
      </DashboardWrapper>
    )
  }

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Dogs</h1>
            <p className="text-muted-foreground">Manage your registered service dogs</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/dogs/register">
              <Plus className="h-4 w-4 mr-2" />
              Register New Dog
            </Link>
          </Button>
        </div>

        {userDogs && userDogs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {userDogs.map((dog) => (
              <Card key={dog.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                        <AvatarImage src={dog.profileImage || undefined} alt={dog.name} />
                        <AvatarFallback className="bg-sds-purple-100 text-sds-purple-700 text-lg font-semibold">
                          {getInitials(dog.name)}
                        </AvatarFallback>
                      </Avatar>
                      <StatusBadge 
                        variant={dog.status === "ACTIVE" ? "approved" : "pending"} 
                        className="absolute -bottom-2 -right-2 text-xs"
                      >
                        {dog.status.replace("_", " ")}
                      </StatusBadge>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-sds-purple-700 transition-colors">
                            {dog.name}
                          </h3>
                          <p className="text-sm text-gray-600">{dog.breed}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            #{dog.registrationNum}
                          </Badge>
                        </div>
                      </div>

                      {dog.bio && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {dog.bio}
                        </p>
                      )}

                      {/* Team Members */}
                      {dog.teamMembers && dog.teamMembers.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          <User className="h-4 w-4 text-gray-500" />
                          <div className="flex flex-wrap gap-1">
                            {dog.teamMembers.slice(0, 2).map((member: any, index: number) => (
                              <Badge key={member.id} variant="secondary" className="text-xs">
                                {member.name} ({member.relationship})
                              </Badge>
                            ))}
                            {dog.teamMembers.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{dog.teamMembers.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recent Achievements */}
                      {dog.recentAchievements && dog.recentAchievements.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <div className="flex flex-wrap gap-1">
                            {dog.recentAchievements.slice(0, 1).map((achievement) => (
                              <Badge key={achievement.id} variant="secondary" className="text-xs">
                                {achievement.title}
                              </Badge>
                            ))}
                            {dog.recentAchievements.length > 1 && (
                              <Badge variant="outline" className="text-xs">
                                +{dog.recentAchievements.length - 1} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          {dog.trainingEndDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Completed {formatDistanceToNow(new Date(dog.trainingEndDate), { addSuffix: true })}</span>
                            </div>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dogs/${dog.id}`}>
                            View Profile
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <PawPrint className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Dogs Registered</h3>
              <p className="text-gray-600 mb-6">
                You haven&apos;t registered any service dogs yet. Get started by registering your first dog.
              </p>
              <Button asChild>
                <Link href="/dashboard/dogs/register">
                  <Plus className="h-4 w-4 mr-2" />
                  Register Your First Dog
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardWrapper>
  )
}