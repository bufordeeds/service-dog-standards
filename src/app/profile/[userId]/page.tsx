"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { api } from "@/utils/api"
import { useUser } from "@/contexts/user-context"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Globe,
  ArrowLeft,
  MessageCircle,
  UserPlus,
  Shield,
  Eye,
  EyeOff
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export default function PublicProfilePage() {
  const params = useParams()
  const { user: currentUser } = useUser()
  const userId = params.userId as string

  // Get public profile data
  const { data: profile, isLoading, error } = api.auth.getPublicProfile.useQuery(
    { userId },
    { enabled: !!userId }
  )

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "HANDLER": return "Handler"
      case "TRAINER": return "Professional Trainer"
      case "AIDE": return "Training Aide"
      case "ADMIN": return "Administrator"
      case "SUPER_ADMIN": return "Super Administrator"
      default: return role
    }
  }

  const getAccountTypeLabel = (accountType: string) => {
    switch (accountType) {
      case "INDIVIDUAL": return "Individual"
      case "PROFESSIONAL": return "Professional"
      case "ORGANIZATION": return "Organization"
      default: return accountType
    }
  }

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
    }
    if (firstName) return firstName[0]?.toUpperCase() ?? "U"
    if (email) return email[0]?.toUpperCase() ?? "U"
    return "U"
  }

  const isOwnProfile = currentUser?.id === userId

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sds-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This profile doesn't exist or is private.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Check if profile is private (this would be determined by user privacy settings)
  const isPrivateProfile = !profile.publicProfile && !isOwnProfile

  if (isPrivateProfile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <EyeOff className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Private Profile</h1>
            <p className="text-muted-foreground mb-6">
              This user has set their profile to private.
            </p>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button asChild variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            
            {!isOwnProfile && (
              <div className="flex gap-2">
                <Button variant="outline">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>
                {profile.role === "TRAINER" && (
                  <Button className="sds-btn-primary">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                )}
              </div>
            )}

            {isOwnProfile && (
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/profile/settings">
                    <Shield className="mr-2 h-4 w-4" />
                    Privacy
                  </Link>
                </Button>
                <Button asChild className="sds-btn-primary">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32 border-4 border-muted">
                    <AvatarImage src={profile.profileImage || undefined} alt={profile.firstName} />
                    <AvatarFallback className="text-2xl bg-sds-purple-50 text-sds-purple-600">
                      {getInitials(profile.firstName, profile.lastName, profile.email)}
                    </AvatarFallback>
                  </Avatar>
                  {!profile.publicProfile && isOwnProfile && (
                    <Badge variant="outline" className="text-xs">
                      <Eye className="mr-1 h-3 w-3" />
                      Private Profile
                    </Badge>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    {profile.title && (
                      <p className="text-lg text-muted-foreground">{profile.title}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge variant="approved">
                      {getRoleLabel(profile.role)}
                    </StatusBadge>
                    <Badge variant="outline">
                      {getAccountTypeLabel(profile.accountType)}
                    </Badge>
                    {profile.memberNumber && (
                      <Badge variant="outline">
                        Member #{profile.memberNumber}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    {profile.city && profile.state && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {profile.city}, {profile.state}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Member since {format(new Date(profile.createdAt), "MMMM yyyy")}
                    </div>

                    {profile.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sds-primary hover:underline"
                        >
                          {profile.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          {profile.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{profile.bio}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Service Dogs */}
          {profile.role === "HANDLER" && (
            <Card>
              <CardHeader>
                <CardTitle>Service Dogs</CardTitle>
                <CardDescription>
                  Registered service dogs for this handler
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* This would show public dog profiles */}
                <div className="text-center py-8 text-muted-foreground">
                  <p>Service dog information is private</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trainer Info */}
          {profile.role === "TRAINER" && (
            <div className="space-y-6">
              {/* Certifications & Credentials */}
              <Card>
                <CardHeader>
                  <CardTitle>Certifications & Experience</CardTitle>
                  <CardDescription>
                    Professional credentials and training experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Professional information will be displayed here</p>
                  </div>
                </CardContent>
              </Card>

              {/* Training Specialties */}
              <Card>
                <CardHeader>
                  <CardTitle>Training Specialties</CardTitle>
                  <CardDescription>
                    Areas of expertise and training focus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Training specialties will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Contact Information (if public) */}
          {(profile.publicEmail || profile.publicPhone) && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Get in touch with {profile.firstName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {profile.publicEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${profile.email}`} className="text-sds-primary hover:underline">
                      {profile.email}
                    </a>
                  </div>
                )}
                {profile.publicPhone && profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${profile.phone}`} className="text-sds-primary hover:underline">
                      {profile.phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}