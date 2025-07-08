"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { Separator } from "@/components/ui/separator"
import { api } from "@/utils/api"
import { useUser } from "@/contexts/user-context"
import { 
  ArrowLeft,
  MapPin, 
  Star, 
  Users, 
  Award,
  Mail,
  Phone,
  Globe,
  Calendar,
  Clock,
  CheckCircle,
  Verified,
  MessageCircle,
  UserPlus,
  ExternalLink,
  Quote
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default function TrainerProfilePage() {
  const params = useParams()
  const userContext = useUser()
  const currentUser = userContext?.user as { id?: string } | null
  const trainerId = Array.isArray(params?.trainerId) ? params.trainerId[0] : params?.trainerId as string

  // This would be a real API call
  const { data: trainer, isPending, error } = api.auth.getPublicProfile?.useQuery(
    { userId: trainerId },
    { enabled: !!trainerId }
  ) ?? { data: null, isPending: true, error: null }

  // Use real trainer data only
  if (!trainer && !isPending) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Trainer Not Found</h1>
            <p className="text-gray-600 mb-8">The trainer profile you're looking for could not be found.</p>
            <Button asChild>
              <Link href="/trainers">Browse All Trainers</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const displayTrainer = trainer

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
  }

  const isOwnProfile = currentUser?.id === trainerId

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sds-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading trainer profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !displayTrainer) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Trainer Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This trainer profile doesn&apos;t exist or is no longer available.
            </p>
            <Button asChild variant="outline">
              <Link href="/trainers">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Directory
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Reviews would come from API in real implementation
  const reviews: Array<{
    id: string;
    author: string;
    rating: number;
    date: Date;
    text: string;
    verified: boolean;
  }> = []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button asChild variant="outline">
            <Link href="/trainers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Directory
            </Link>
          </Button>
          
          {!isOwnProfile && (
            <div className="flex gap-3">
              <Button variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                Message
              </Button>
              <Button className="sds-btn-primary">
                <UserPlus className="mr-2 h-4 w-4" />
                Connect
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                      <AvatarImage src={displayTrainer.profileImage || undefined} alt={displayTrainer.firstName} />
                      <AvatarFallback className="bg-sds-purple-100 text-sds-purple-700 text-2xl font-bold">
                        {getInitials(displayTrainer.firstName, displayTrainer.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    {displayTrainer.isVerified && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                        <Verified className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                          {displayTrainer.firstName} {displayTrainer.lastName}
                        </h1>
                        {displayTrainer.businessName && (
                          <p className="text-lg text-gray-600 font-medium">{displayTrainer.businessName}</p>
                        )}
                      </div>

                      {displayTrainer.rating && (
                        <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{(displayTrainer.rating as number).toFixed(1)}</span>
                          <span className="text-gray-600">({displayTrainer.reviewCount} reviews)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <StatusBadge variant="approved" size="sm">
                        Professional Trainer
                      </StatusBadge>
                      {displayTrainer.isVerified && (
                        <Badge variant="default" className="bg-blue-500">
                          <Verified className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                      {displayTrainer.memberNumber && (
                        <Badge variant="outline">
                          #{displayTrainer.memberNumber}
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      {(displayTrainer.city || displayTrainer.state) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{displayTrainer.city}{displayTrainer.city && displayTrainer.state ? ', ' : ''}{displayTrainer.state}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>Member since {format(new Date(displayTrainer.createdAt), "MMMM yyyy")}</span>
                      </div>

                      {displayTrainer.yearsExperience && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-gray-500" />
                          <span>{displayTrainer.yearsExperience} years experience</span>
                        </div>
                      )}

                      {displayTrainer.availability?.responseTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Responds in {(displayTrainer.availability as { responseTime: string }).responseTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {displayTrainer.bio}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Specialties */}
            {displayTrainer.specialties && displayTrainer.specialties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Training Specialties</CardTitle>
                  <CardDescription>
                    Areas of expertise and focus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {(displayTrainer.specialties as string[] || []).map((specialty, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium">{specialty}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Client Reviews</span>
                  <Badge variant="outline">{reviews.length} reviews</Badge>
                </CardTitle>
                <CardDescription>
                  Feedback from service dog handlers and their families
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start gap-4">
                        <Quote className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.author}</span>
                              {review.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  <Verified className="mr-1 h-3 w-3" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5) as unknown[]].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${
                                    i < review.rating 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">{review.text}</p>
                          <p className="text-sm text-gray-500">
                            {format(review.date, "MMMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayTrainer.publicEmail && displayTrainer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <a 
                      href={`mailto:${displayTrainer.email}`}
                      className="text-sds-primary hover:underline font-medium"
                    >
                      {displayTrainer.email}
                    </a>
                  </div>
                )}

                {displayTrainer.publicPhone && displayTrainer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <a 
                      href={`tel:${displayTrainer.phone}`}
                      className="text-sds-primary hover:underline font-medium"
                    >
                      {displayTrainer.phone}
                    </a>
                  </div>
                )}

                {displayTrainer.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-500" />
                    <a 
                      href={displayTrainer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sds-primary hover:underline font-medium flex items-center gap-1"
                    >
                      Visit Website
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <Button className="w-full sds-btn-primary">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Request Connection
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Credentials */}
            {displayTrainer.certifications && displayTrainer.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(displayTrainer.certifications as string[] || []).map((cert, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Award className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{cert}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Availability */}
            {displayTrainer.availability && (
              <Card>
                <CardHeader>
                  <CardTitle>Availability</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      (displayTrainer.availability as { accepting?: boolean })?.accepting ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium">
                      {(displayTrainer.availability as { accepting?: boolean })?.accepting ? 'Accepting new clients' : 'Not accepting new clients'}
                    </span>
                  </div>
                  
                  {(displayTrainer.availability as { nextAvailable?: Date })?.nextAvailable && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Next available: {format((displayTrainer.availability as { nextAvailable: Date }).nextAvailable, "MMMM d, yyyy")}</span>
                    </div>
                  )}

                  {(displayTrainer.availability as { responseTime?: string })?.responseTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Typical response: {(displayTrainer.availability as { responseTime: string }).responseTime}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            {displayTrainer.achievements && displayTrainer.achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(displayTrainer.achievements as string[] || []).map((achievement, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}