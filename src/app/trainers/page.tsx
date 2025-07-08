"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/ui/status-badge"
import { api } from "@/utils/api"
import { 
  Search, 
  MapPin, 
  Star, 
  Users, 
  Award,
  Filter,
  Mail,
  Globe,
  ChevronRight,
  Verified
} from "lucide-react"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
    // Trainer-specific fields that would be added to the schema
    businessName?: string
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
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Trainer Avatar */}
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
              <AvatarImage src={trainer.profileImage || undefined} alt={trainer.firstName} />
              <AvatarFallback className="bg-sds-purple-100 text-sds-purple-700 text-lg font-semibold">
                {getInitials(trainer.firstName, trainer.lastName)}
              </AvatarFallback>
            </Avatar>
            {trainer.isVerified && (
              <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                <Verified className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          {/* Trainer Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-sds-purple-700 transition-colors">
                  {trainer.firstName} {trainer.lastName}
                </h3>
                {trainer.businessName && (
                  <p className="text-sm text-gray-600 font-medium">{trainer.businessName}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {trainer.memberNumber && (
                    <Badge variant="outline" className="text-xs">
                      #{trainer.memberNumber}
                    </Badge>
                  )}
                  <StatusBadge variant="approved" size="sm">
                    Professional Trainer
                  </StatusBadge>
                </div>
              </div>

              {trainer.rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{trainer.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({trainer.reviewCount})</span>
                </div>
              )}
            </div>

            {/* Location */}
            {(trainer.city || trainer.state) && (
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{trainer.city}{trainer.city && trainer.state ? ', ' : ''}{trainer.state}</span>
              </div>
            )}

            {/* Specialties */}
            {trainer.specialties && trainer.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {trainer.specialties.slice(0, 3).map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {trainer.specialties.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{trainer.specialties.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Bio Preview */}
            {trainer.bio && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {trainer.bio}
              </p>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                {trainer.yearsExperience && (
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span>{trainer.yearsExperience} years</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Available</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {trainer.publicEmail && trainer.email && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`mailto:${trainer.email}`}>
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {trainer.website && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={trainer.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/trainers/${trainer.id}`}>
                    View Profile
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
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

  // Mock data for demonstration
  const mockTrainers = [
    {
      id: "trainer-1",
      firstName: "Sarah",
      lastName: "Wilson",
      businessName: "Wilson Dog Training Academy",
      profileImage: null,
      bio: "Certified professional dog trainer with 15 years of experience specializing in service dog training and behavioral modification.",
      city: "Seattle",
      state: "WA",
      website: "https://wilsondogtraining.com",
      memberNumber: "TR-2019-001",
      publicEmail: true,
      publicPhone: true,
      email: "sarah@wilsondogtraining.com",
      phone: "(206) 555-0123",
      specialties: ["Service Dogs", "Behavioral Issues", "Public Access Training"],
      yearsExperience: 15,
      rating: 4.9,
      reviewCount: 127,
      isVerified: true,
    },
    {
      id: "trainer-2", 
      firstName: "Michael",
      lastName: "Rodriguez",
      businessName: "Precision Canine Training",
      profileImage: null,
      bio: "Former military dog handler specializing in PTSD service dogs and mobility assistance training.",
      city: "Austin",
      state: "TX",
      website: null,
      memberNumber: "TR-2020-045",
      publicEmail: true,
      publicPhone: false,
      email: "mike@precisioncanine.com",
      phone: null,
      specialties: ["PTSD Service Dogs", "Mobility Assistance", "Task Training"],
      yearsExperience: 12,
      rating: 4.8,
      reviewCount: 89,
      isVerified: true,
    },
    {
      id: "trainer-3",
      firstName: "Jennifer",
      lastName: "Chen", 
      businessName: "Gentle Paws Training",
      profileImage: null,
      bio: "Positive reinforcement specialist focusing on anxiety and autism support dogs for children and adults.",
      city: "Portland",
      state: "OR",
      website: "https://gentlepaws.org",
      memberNumber: "TR-2021-112",
      publicEmail: true,
      publicPhone: true,
      email: "jen@gentlepaws.org",
      phone: "(503) 555-0198",
      specialties: ["Autism Support", "Anxiety Support", "Pediatric Training"],
      yearsExperience: 8,
      rating: 4.7,
      reviewCount: 64,
      isVerified: false,
    },
  ]

  const displayTrainers = trainers && trainers.length > 0 ? trainers : mockTrainers

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
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with certified service dog trainers in your area. All trainers are vetted 
            members of the Service Dog Standards community.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Trainers
            </CardTitle>
            <CardDescription>
              Find trainers by name, location, or specialty
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <Label htmlFor="search">Search by name or business</Label>
                <Input
                  id="search"
                  placeholder="Enter trainer name or business..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="state">State</Label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any state</SelectItem>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any specialty</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchQuery || selectedState || selectedSpecialty) && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs">
                    Search: {searchQuery}
                  </Badge>
                )}
                {selectedState && (
                  <Badge variant="secondary" className="text-xs">
                    State: {selectedState}
                  </Badge>
                )}
                {selectedSpecialty && (
                  <Badge variant="secondary" className="text-xs">
                    Specialty: {selectedSpecialty}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedState("")
                    setSelectedSpecialty("")
                  }}
                  className="text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {isPending ? "Loading..." : `${displayTrainers.length} Professional Trainers`}
            </h2>
            <p className="text-gray-600">
              Certified trainers available in your area
            </p>
          </div>
        </div>

        {/* Trainers Grid */}
        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sds-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading trainers...</p>
            </div>
          </div>
        ) : displayTrainers.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {displayTrainers.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No trainers found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria to find more trainers.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedState("")
                  setSelectedSpecialty("")
                }}
              >
                Clear filters
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