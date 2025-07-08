"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/ui/status-badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Search, 
  MapPin, 
  Star, 
  Users, 
  Award,
  Mail,
  ExternalLink,
  Verified
} from "lucide-react"
import { api } from "@/utils/api"
import Link from "next/link"

interface TrainerCardProps {
  trainer: {
    id: string
    firstName: string
    lastName: string
    profileImage?: string | null
    bio?: string | null
    city?: string | null
    state?: string | null
    website?: string | null
    memberNumber?: string | null
    publicEmail?: boolean
    publicPhone?: boolean
    email?: string
    phone?: string | null
    specialties?: string[]
    yearsExperience?: number
    rating?: number
    reviewCount?: number
    isVerified?: boolean
  }
}

function TrainerCard({ trainer }: TrainerCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-gray-200">
              <AvatarImage src={trainer.profileImage || undefined} alt={trainer.firstName} />
              <AvatarFallback className="bg-sds-purple-100 text-sds-purple-700 font-bold">
                {getInitials(trainer.firstName, trainer.lastName)}
              </AvatarFallback>
            </Avatar>
            {trainer.isVerified && (
              <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                <Verified className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 truncate">
                  {trainer.firstName} {trainer.lastName}
                </h3>
                {trainer.memberNumber && (
                  <p className="text-sm text-gray-500">#{trainer.memberNumber}</p>
                )}
              </div>
              
              {trainer.rating && (
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{trainer.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <StatusBadge variant="approved" size="sm">
                Professional Trainer
              </StatusBadge>
              {trainer.isVerified && (
                <Badge variant="default" className="bg-blue-500 text-xs">
                  Verified
                </Badge>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {(trainer.city || trainer.state) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{trainer.city}{trainer.city && trainer.state ? ', ' : ''}{trainer.state}</span>
                </div>
              )}
              
              {trainer.yearsExperience && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Award className="h-4 w-4" />
                  <span>{trainer.yearsExperience} years experience</span>
                </div>
              )}
            </div>

            {trainer.bio && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {trainer.bio}
              </p>
            )}

            <div className="flex items-center justify-between">
              <Button asChild variant="outline" size="sm">
                <Link href={`/trainers/${trainer.id}`}>
                  <Users className="mr-2 h-4 w-4" />
                  View Profile
                </Link>
              </Button>
              
              <div className="flex items-center gap-2">
                {trainer.publicEmail && trainer.email && (
                  <Button asChild variant="ghost" size="sm">
                    <a href={`mailto:${trainer.email}`}>
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {trainer.website && (
                  <Button asChild variant="ghost" size="sm">
                    <a href={trainer.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TrainersDirectoryPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedState, setSelectedState] = React.useState<string>("")
  const [selectedSpecialty, setSelectedSpecialty] = React.useState<string>("")

  // This would be a real API call to get trainers
  const { data: trainers, isPending } = api.auth.getTrainers?.useQuery({
    search: searchQuery,
    state: selectedState,
    specialty: selectedSpecialty,
  }) ?? { data: [], isPending: true }

  const displayTrainers = trainers || []

  const specialties = [
    "Service Dogs",
    "PTSD Service Dogs", 
    "Mobility Assistance",
    "Autism Support",
    "Anxiety Support",
    "Behavioral Issues",
    "Public Access Training",
    "Task Training",
    "Pediatric Training"
  ]

  const states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Professional Trainers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with certified service dog trainers in your area. Our network includes 
            experienced professionals specializing in various training methods and service dog types.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Trainers
            </CardTitle>
            <CardDescription>
              Search by name, location, or specialty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Input
                  placeholder="Search trainers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All States</SelectItem>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Specialties</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isPending ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sds-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading trainers...</p>
          </div>
        ) : displayTrainers.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {displayTrainers.map((trainer) => (
              <React.Fragment key={trainer.id}>
                {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */}
                <TrainerCard trainer={trainer as any} />
              </React.Fragment>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No trainers found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or check back later as we continue to grow our network.
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  <span className="mr-2">←</span>
                  Back to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-sds-purple-600 to-sds-purple-700 text-white">
          <CardContent className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4">
              Are you a professional trainer?
            </h3>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Join our network of certified trainers and connect with handlers seeking 
              professional service dog training services.
            </p>
            <Button asChild variant="secondary" size="lg">
              <Link href="/auth/register?role=trainer">
                Join as a Trainer
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}