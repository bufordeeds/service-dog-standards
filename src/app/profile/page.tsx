"use client"

import * as React from "react"
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/ui/image-upload"
import { StatusBadge } from "@/components/ui/status-badge"
import { api } from "@/utils/api"
import { useUser } from "@/contexts/user-context"
import { toast } from "@/hooks/use-toast"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Save, 
  X,
  Camera,
  Shield,
  Calendar,
  Globe
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export default function ProfilePage() {
  const { user, getInitials } = useUser()
  const [isEditing, setIsEditing] = React.useState(false)
  const [profileImage, setProfileImage] = React.useState<string | null>(null)
  
  const { data: profile, refetch } = api.auth.getProfile.useQuery()
  
  const updateProfileMutation = api.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
      setIsEditing(false)
      void refetch()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    city: "",
    state: "",
    website: "",
  })

  React.useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        city: profile.city || "",
        state: profile.state || "",
        website: profile.website || "",
      })
      setProfileImage(profile.profileImage)
    }
  }, [profile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate({
      ...formData,
      profileImage: profileImage || undefined,
    })
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        city: profile.city || "",
        state: profile.state || "",
        website: profile.website || "",
      })
      setProfileImage(profile.profileImage)
    }
    setIsEditing(false)
  }

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

  if (!profile) {
    return (
      <DashboardWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sds-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardWrapper>
    )
  }

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and privacy settings
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/profile/settings">
                <Shield className="mr-2 h-4 w-4" />
                Privacy Settings
              </Link>
            </Button>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} className="sds-btn-primary">
                <Edit3 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Header Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Profile Image */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32 border-4 border-muted">
                    <AvatarImage src={profileImage || undefined} alt={formData.firstName} />
                    <AvatarFallback className="text-2xl bg-sds-purple-50 text-sds-purple-600">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <ImageUpload
                      value={profileImage}
                      onChange={setProfileImage}
                      maxSize={5 * 1024 * 1024} // 5MB
                      accept="image/*"
                      className="w-full"
                    >
                      <Button type="button" variant="outline" size="sm">
                        <Camera className="mr-2 h-4 w-4" />
                        Change Photo
                      </Button>
                    </ImageUpload>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="firstName">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                      ) : (
                        <p className="text-lg font-semibold">{formData.firstName}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="lastName">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                      ) : (
                        <p className="text-lg font-semibold">{formData.lastName}</p>
                      )}
                    </div>
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

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Member since {format(new Date(profile.createdAt), "MMMM yyyy")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Your contact details for communication and verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p>{formData.email}</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p>{formData.phone || "Not provided"}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">City</Label>
                  {isEditing ? (
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Your city"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p>{formData.city || "Not provided"}</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  {isEditing ? (
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="Your state"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p>{formData.state || "Not provided"}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                {isEditing ? (
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://your-website.com"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {formData.website ? (
                      <a
                        href={formData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sds-primary hover:underline"
                      >
                        {formData.website}
                      </a>
                    ) : (
                      <p>Not provided</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                About Me
              </CardTitle>
              <CardDescription>
                Tell others about yourself and your experience with service dogs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Share your story, experience with service dogs, or anything you'd like others to know about you..."
                  rows={4}
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  {formData.bio ? (
                    <p className="whitespace-pre-wrap">{formData.bio}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No bio provided yet</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="sds-btn-primary"
                disabled={updateProfileMutation.isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                {updateProfileMutation.isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </DashboardWrapper>
  )
}