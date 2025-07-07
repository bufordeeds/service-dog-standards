# Component Architecture & UI Structure Plan

## Overview

This document outlines the component architecture and UI structure for the Service Dog Standards Next.js application, focusing on mobile-first design, dashboard cards/pods, and a scalable component system.

## Design System Foundation

### 1. Core Design Principles

- **Mobile-First**: All components designed for mobile, enhanced for desktop
- **Card-Based Layout**: Rounded corner "pods" for dashboard elements
- **Accessibility**: WCAG 2.1 AA compliance throughout
- **Consistent Spacing**: 4px grid system with Tailwind spacing
- **Brand Consistency**: Multi-tenant theming support

### 2. Technology Stack

```typescript
// UI Foundation
- shadcn/ui: Base component library
- Tailwind CSS: Utility-first styling
- Radix UI: Accessible primitives
- Lucide Icons: Consistent icon system
- Framer Motion: Smooth animations

// Forms & Validation
- React Hook Form: Form state management
- Zod: Schema validation
- React Dropzone: File uploads

// State Management
- Zustand: Client-side state (cart, UI state)
- TanStack Query: Server state caching
- React Context: Theme and organization context
```

### 3. Color System & Theming

```typescript
// tailwind.config.ts
const config = {
  theme: {
    extend: {
      colors: {
        // Default SDS theme
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Multi-tenant theme variables
        brand: {
          primary: 'hsl(var(--brand-primary))',
          secondary: 'hsl(var(--brand-secondary))',
          accent: 'hsl(var(--brand-accent))',
        },
        // Status colors
        status: {
          active: '#10b981',
          pending: '#f59e0b',
          inactive: '#ef4444',
          retired: '#6b7280',
        }
      },
      borderRadius: {
        'card': '1.5rem', // 24px - signature rounded corners
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  }
}
```

## Component Architecture

### 1. Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/                # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── mobile-nav.tsx
│   │   └── footer.tsx
│   ├── dashboard/             # Dashboard-specific components
│   │   ├── agreement-card.tsx
│   │   ├── completion-gauge.tsx
│   │   ├── dogs-list-card.tsx
│   │   ├── stats-card.tsx
│   │   └── dashboard-grid.tsx
│   ├── auth/                  # Authentication components
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   └── auth-guard.tsx
│   ├── forms/                 # Form components
│   │   ├── dog-registration-form.tsx
│   │   ├── profile-form.tsx
│   │   └── address-form.tsx
│   ├── shop/                  # E-commerce components
│   │   ├── product-card.tsx
│   │   ├── cart-drawer.tsx
│   │   ├── checkout-form.tsx
│   │   └── order-summary.tsx
│   ├── dogs/                  # Dog-related components
│   │   ├── dog-card.tsx
│   │   ├── dog-profile.tsx
│   │   ├── dog-gallery.tsx
│   │   └── dog-status-badge.tsx
│   ├── shared/                # Shared components
│   │   ├── image-upload.tsx
│   │   ├── search-bar.tsx
│   │   ├── pagination.tsx
│   │   ├── loading-spinner.tsx
│   │   └── error-boundary.tsx
│   └── providers/             # Context providers
│       ├── theme-provider.tsx
│       ├── organization-provider.tsx
│       └── cart-provider.tsx
├── lib/
│   ├── utils.ts               # Utility functions
│   ├── validations/           # Zod schemas
│   ├── hooks/                 # Custom React hooks
│   └── constants/             # App constants
└── styles/
    ├── globals.css            # Global styles
    └── components.css         # Component-specific styles
```

### 2. Dashboard Architecture

The dashboard is the core of the user experience, designed around the "pods/cards" concept from the requirements.

```tsx
// components/dashboard/dashboard-grid.tsx
'use client'

import { AgreementCard } from "./agreement-card"
import { CompletionGauge } from "./completion-gauge"
import { DogsListCard } from "./dogs-list-card"
import { StatsCard } from "./stats-card"

interface DashboardGridProps {
  user: {
    id: string
    role: UserRole
    profileComplete: number
    agreements: Agreement[]
    dogs: Dog[]
  }
}

export function DashboardGrid({ user }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {/* First Row - Always visible */}
      <AgreementCard 
        agreements={user.agreements} 
        className="col-span-1 md:col-span-2 lg:col-span-1" 
      />
      <CompletionGauge 
        percentage={user.profileComplete} 
        className="col-span-1" 
      />
      <DogsListCard 
        dogs={user.dogs} 
        userRole={user.role}
        className="col-span-1 md:col-span-2 lg:col-span-1" 
      />
      
      {/* Second Row - Conditional based on role */}
      {user.role === 'TRAINER' && (
        <StatsCard 
          title="Training Analytics" 
          data={user.trainerStats}
          className="col-span-1 md:col-span-2 lg:col-span-2" 
        />
      )}
      
      {user.role === 'ADMIN' && (
        <StatsCard 
          title="Admin Overview" 
          data={user.adminStats}
          className="col-span-1 md:col-span-2 lg:col-span-3" 
        />
      )}
    </div>
  )
}
```

### 3. Core Dashboard Components

#### Agreement Card Component

```tsx
// components/dashboard/agreement-card.tsx
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface AgreementCardProps {
  agreements: Agreement[]
  className?: string
}

export function AgreementCard({ agreements, className }: AgreementCardProps) {
  const currentAgreement = agreements.find(a => a.type === 'TRAINING_BEHAVIOR_STANDARDS' && a.isActive)
  const isExpired = currentAgreement ? new Date(currentAgreement.expiresAt) < new Date() : true
  const daysUntilExpiry = currentAgreement ? 
    Math.ceil((new Date(currentAgreement.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <Card className={`rounded-card hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          {currentAgreement ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          SDS Agreement
        </CardTitle>
        <CardDescription>
          Training & Behavior Standards Agreement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentAgreement ? (
          <>
            <div className="flex items-center gap-2">
              <Badge variant={daysUntilExpiry > 180 ? "default" : "destructive"}>
                {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : 'Expired'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              Expires {formatDistanceToNow(new Date(currentAgreement.expiresAt), { addSuffix: true })}
            </div>
            {daysUntilExpiry < 180 && (
              <Button variant="outline" className="w-full">
                Renew Agreement
              </Button>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Accept the SDS Training & Behavior Standards Agreement to activate your account.
            </p>
            <Button className="w-full">
              Accept Agreement
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

#### Completion Gauge Component

```tsx
// components/dashboard/completion-gauge.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { User, Camera, FileText, CreditCard } from "lucide-react"

interface CompletionGaugeProps {
  percentage: number
  className?: string
}

export function CompletionGauge({ percentage, className }: CompletionGaugeProps) {
  const completionSteps = [
    { icon: User, label: "Profile Info", completed: percentage > 25 },
    { icon: Camera, label: "Profile Photo", completed: percentage > 50 },
    { icon: FileText, label: "Agreements", completed: percentage > 75 },
    { icon: CreditCard, label: "Registration", completed: percentage === 100 },
  ]

  return (
    <Card className={`rounded-card hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle>Account Completion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Circular Progress */}
        <div className="flex items-center justify-center">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#3b82f6"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="space-y-2">
          {completionSteps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <step.icon className={`h-4 w-4 ${step.completed ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={`text-sm ${step.completed ? 'text-green-600' : 'text-gray-600'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {percentage < 100 && (
          <Button variant="outline" className="w-full">
            Continue Setup
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
```

#### Dogs List Card Component

```tsx
// components/dashboard/dogs-list-card.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Settings, Eye } from "lucide-react"
import { DogStatus } from "@prisma/client"

interface DogsListCardProps {
  dogs: Array<{
    id: string
    name: string
    registrationNum: string
    status: DogStatus
    profileImage?: string
    handler?: {
      firstName: string
      lastName: string
    }
  }>
  userRole: UserRole
  className?: string
}

export function DogsListCard({ dogs, userRole, className }: DogsListCardProps) {
  const getStatusColor = (status: DogStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500'
      case 'IN_TRAINING': return 'bg-yellow-500'
      case 'RETIRED': return 'bg-gray-500'
      case 'WASHED_OUT': return 'bg-red-500'
      case 'IN_MEMORIAM': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card className={`rounded-card hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Registered Dogs</CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add Dog
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {dogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No dogs registered yet</p>
            <Button>Register Your First Dog</Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {dogs.map((dog) => (
              <div key={dog.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={dog.profileImage} alt={dog.name} />
                    <AvatarFallback>{dog.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getStatusColor(dog.status)} border-2 border-white`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{dog.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      #{dog.registrationNum}
                    </Badge>
                  </div>
                  {dog.handler && (
                    <p className="text-sm text-gray-600 truncate">
                      Handler: {dog.handler.firstName} {dog.handler.lastName}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 capitalize">
                    {dog.status.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
                
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### 4. Mobile Navigation System

```tsx
// components/layout/mobile-nav.tsx
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Dog, ShoppingCart, User, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dogs", label: "My Dogs", icon: Dog },
    { href: "/shop", label: "Shop", icon: ShoppingCart },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <nav className="space-y-2 pt-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                pathname === item.href 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
```

### 5. Form Components

```tsx
// components/forms/dog-registration-form.tsx
'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/shared/image-upload"
import { api } from "@/utils/api"

const dogSchema = z.object({
  name: z.string().min(1, "Dog name is required"),
  breed: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "MALE_NEUTERED", "FEMALE_SPAYED"]).optional(),
  weight: z.number().optional(),
  color: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
})

type DogFormData = z.infer<typeof dogSchema>

export function DogRegistrationForm() {
  const [profileImage, setProfileImage] = useState<string>("")
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<DogFormData>({
    resolver: zodResolver(dogSchema),
  })

  const createDogMutation = api.dogs.create.useMutation({
    onSuccess: () => {
      // Handle success
    },
  })

  const onSubmit = (data: DogFormData) => {
    createDogMutation.mutate({
      ...data,
      profileImage,
    })
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register Your Service Dog</CardTitle>
        <CardDescription>
          Provide information about your service dog to complete registration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Image */}
          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <ImageUpload
              value={profileImage}
              onChange={(url) => {
                setProfileImage(url)
                setValue("profileImage", url)
              }}
              className="mx-auto"
            />
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dog Name *</Label>
              <Input
                id="name"
                {...register("name")}
                error={errors.name?.message}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                {...register("breed")}
                placeholder="e.g., Golden Retriever"
              />
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                {...register("birthDate")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={(value) => setValue("gender", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="MALE_NEUTERED">Male (Neutered)</SelectItem>
                  <SelectItem value="FEMALE_SPAYED">Female (Spayed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input
                id="weight"
                type="number"
                {...register("weight", { valueAsNumber: true })}
                placeholder="50"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              {...register("bio")}
              placeholder="Tell us about your service dog..."
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={createDogMutation.isLoading}
          >
            {createDogMutation.isLoading ? "Registering..." : "Register Dog"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

### 6. Responsive Design Patterns

```tsx
// components/layout/responsive-container.tsx
interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveContainer({ children, className = "" }: ResponsiveContainerProps) {
  return (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}

// Usage in layouts
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-6">
        <ResponsiveContainer>
          {children}
        </ResponsiveContainer>
      </main>
    </div>
  )
}
```

### 7. Animation Components

```tsx
// components/shared/animated-counter.tsx
'use client'

import { useEffect, useState } from "react"
import { useInView } from "framer-motion"
import { useRef } from "react"

interface AnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
  className?: string
}

export function AnimatedCounter({ end, duration = 2000, suffix = "", className = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      setCount(Math.floor(startValue + (end - startValue) * easeOut))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, end, duration])

  return (
    <span ref={ref} className={className}>
      {count}{suffix}
    </span>
  )
}
```

## Mobile-Specific Considerations

### 1. Touch Interactions
- **Minimum touch targets**: 44px × 44px
- **Swipe gestures**: For cards, modals, and navigation
- **Pull-to-refresh**: For data lists
- **Haptic feedback**: For important actions

### 2. Performance Optimization
- **Lazy loading**: Images and components
- **Virtual scrolling**: For long lists
- **Code splitting**: Route-based chunks
- **Image optimization**: next/image with responsive sizes

### 3. Offline Support
- **Service worker**: For core functionality
- **Cache management**: For frequently accessed data
- **Offline indicators**: Show connection status
- **Sync when online**: Queue actions for later

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- [ ] Set up shadcn/ui components
- [ ] Create base layout components
- [ ] Implement responsive container system
- [ ] Set up theming and multi-tenant support

### Phase 2: Dashboard (Week 2)
- [ ] Build dashboard grid layout
- [ ] Create agreement card component
- [ ] Implement completion gauge
- [ ] Build dogs list card

### Phase 3: Forms & Navigation (Week 3)
- [ ] Build form components with validation
- [ ] Implement mobile navigation
- [ ] Create image upload component
- [ ] Add animation components

### Phase 4: Polish & Optimization (Week 4)
- [ ] Mobile optimization
- [ ] Performance improvements
- [ ] Accessibility testing
- [ ] Animation polish

This component architecture provides a solid foundation for building a modern, accessible, and performant Service Dog Standards application that meets all the mobile-first and card-based design requirements.