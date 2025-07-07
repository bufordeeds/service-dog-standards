# Authentication & Authorization Plan

## Overview

This document outlines the complete authentication and authorization strategy for the Service Dog Standards Next.js application, designed to support multi-tenant architecture, role-based access control, and secure user management.

## Current State Analysis

### Vue App Authentication
- **JWT-based system** with RSA256 asymmetric encryption
- **Custom session management** with database-backed sessions
- **Role-based access control** (HANDLER, TRAINER, AIDE, SDS-ADMIN)
- **Email verification** workflow
- **Password reset** functionality
- **Anonymous user tracking** with session GUIDs

### Next.js Current Setup
- **NextAuth.js v4** with Discord provider only
- **Prisma adapter** for database persistence
- **Basic session management**
- **Limited authentication UI**

## Recommended Authentication Architecture

### 1. NextAuth.js v5 Configuration

```typescript
// auth.config.ts
import { NextAuthConfig } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Apple from "next-auth/providers/apple"
import { db } from "@/lib/db"
import { loginSchema } from "@/lib/validations/auth"
import { verifyPassword } from "@/lib/auth"

export const authConfig = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials)
        
        if (validatedFields.success) {
          const { email, password } = validatedFields.data
          
          const user = await db.user.findUnique({
            where: { email },
            include: { organization: true }
          })
          
          if (!user || !user.hashedPassword) return null
          
          const passwordsMatch = await verifyPassword(password, user.hashedPassword)
          
          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role,
              organizationId: user.organizationId,
              profileComplete: user.profileComplete,
              emailVerified: user.emailVerified,
            }
          }
        }
        
        return null
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth account linking
      if (account?.provider === "google" || account?.provider === "apple") {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! }
        })
        
        if (existingUser && !existingUser.emailVerified) {
          // Auto-verify email for OAuth users
          await db.user.update({
            where: { id: existingUser.id },
            data: { emailVerified: new Date() }
          })
        }
      }
      
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.organizationId = user.organizationId
        token.profileComplete = user.profileComplete
      }
      return token
    },
    async session({ session, token, user }) {
      // Database strategy uses user object directly
      if (user) {
        session.user.id = user.id
        session.user.role = user.role
        session.user.organizationId = user.organizationId
        session.user.profileComplete = user.profileComplete
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
  events: {
    async signIn(message) {
      // Update last login timestamp
      if (message.user.id) {
        await db.user.update({
          where: { id: message.user.id },
          data: { lastLoginAt: new Date() }
        })
      }
    },
  },
} satisfies NextAuthConfig
```

### 2. Role-Based Access Control

```typescript
// lib/auth.ts
import { auth } from "@/auth"
import { UserRole } from "@prisma/client"

export const getCurrentUser = async () => {
  const session = await auth()
  return session?.user
}

export const requireAuth = async () => {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export const requireRole = async (requiredRole: UserRole | UserRole[]) => {
  const user = await requireAuth()
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden")
  }
  
  return user
}

export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy = {
    [UserRole.HANDLER]: 0,
    [UserRole.TRAINER]: 1,
    [UserRole.AIDE]: 1,
    [UserRole.ADMIN]: 2,
    [UserRole.SUPER_ADMIN]: 3,
  }
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
```

### 3. Middleware for Route Protection

```typescript
// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth"

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl
  
  // Public routes that don't require auth
  const publicRoutes = ['/auth', '/api/auth', '/public', '/']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // Check profile completion for incomplete profiles
  if (session.user.profileComplete < 100 && !pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }
  
  // Admin routes
  if (pathname.startsWith('/admin') && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
```

### 4. tRPC Authentication Context

```typescript
// server/api/trpc.ts
import { type CreateNextContextOptions } from "@trpc/server/adapters/next"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts
  const session = await auth()
  
  return {
    db,
    session,
    req,
    res,
  }
}

// Protected procedure
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    })
  }
  
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

// Admin procedure
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "SUPER_ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Insufficient permissions",
    })
  }
  
  return next({ ctx })
})
```

### 5. Email Verification System

```typescript
// lib/email-verification.ts
import { randomBytes } from "crypto"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"

export const generateVerificationToken = async (email: string) => {
  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours
  
  // Delete existing tokens
  await db.verificationToken.deleteMany({
    where: { identifier: email }
  })
  
  // Create new token
  await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    }
  })
  
  return token
}

export const verifyEmailToken = async (token: string) => {
  const verificationToken = await db.verificationToken.findUnique({
    where: { token }
  })
  
  if (!verificationToken) {
    throw new Error("Invalid token")
  }
  
  if (verificationToken.expires < new Date()) {
    throw new Error("Token expired")
  }
  
  // Update user as verified
  await db.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() }
  })
  
  // Delete used token
  await db.verificationToken.delete({
    where: { token }
  })
  
  return true
}
```

### 6. Password Reset System

```typescript
// lib/password-reset.ts
import { randomBytes } from "crypto"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"
import { hashPassword } from "@/lib/auth"

export const generatePasswordResetToken = async (email: string) => {
  const user = await db.user.findUnique({
    where: { email }
  })
  
  if (!user) {
    throw new Error("User not found")
  }
  
  const token = randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour
  
  // Delete existing tokens
  await db.verificationToken.deleteMany({
    where: { identifier: email }
  })
  
  // Create new token
  await db.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    }
  })
  
  await sendPasswordResetEmail(email, token)
  
  return true
}

export const resetPassword = async (token: string, newPassword: string) => {
  const verificationToken = await db.verificationToken.findUnique({
    where: { token }
  })
  
  if (!verificationToken) {
    throw new Error("Invalid token")
  }
  
  if (verificationToken.expires < new Date()) {
    throw new Error("Token expired")
  }
  
  const hashedPassword = await hashPassword(newPassword)
  
  // Update user password
  await db.user.update({
    where: { email: verificationToken.identifier },
    data: { hashedPassword }
  })
  
  // Delete used token
  await db.verificationToken.delete({
    where: { token }
  })
  
  return true
}
```

### 7. Multi-tenant Organization Support

```typescript
// lib/organization.ts
import { db } from "@/lib/db"

export const getOrganizationFromRequest = async (req: NextRequest) => {
  const host = req.headers.get('host')
  const subdomain = host?.split('.')[0]
  
  if (!subdomain) {
    throw new Error("Invalid host")
  }
  
  const organization = await db.organization.findUnique({
    where: { subdomain }
  })
  
  if (!organization) {
    throw new Error("Organization not found")
  }
  
  return organization
}

export const requireOrganizationAccess = async (userId: string, organizationId: string) => {
  const user = await db.user.findFirst({
    where: {
      id: userId,
      organizationId,
    }
  })
  
  if (!user) {
    throw new Error("Access denied")
  }
  
  return user
}
```

## Authentication UI Components

### 1. Login Form

```tsx
// components/auth/login-form.tsx
'use client'

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      setError("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        
        <div className="mt-4 space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("google")}
          >
            Sign in with Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signIn("apple")}
          >
            Sign in with Apple
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 2. Registration Form

```tsx
// components/auth/register-form.tsx
'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/utils/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "HANDLER" as const,
    accountType: "INDIVIDUAL" as const,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  
  const registerMutation = api.auth.register.useMutation({
    onSuccess: () => {
      router.push("/auth/verify-email")
    },
    onError: (error) => {
      setError(error.message)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    registerMutation.mutate(formData)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Join the Service Dog Standards community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">I am a...</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HANDLER">Service Dog Handler</SelectItem>
                <SelectItem value="TRAINER">Service Dog Trainer</SelectItem>
                <SelectItem value="AIDE">Helper/Aide</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

## Security Considerations

### 1. Password Security
- **bcrypt** for password hashing
- **Minimum 8 characters** with complexity requirements
- **Rate limiting** on login attempts
- **Password reset** tokens with short expiration

### 2. Session Security
- **HTTP-only cookies** for session tokens
- **Secure flag** in production
- **SameSite=strict** for CSRF protection
- **Regular token rotation**

### 3. Data Protection
- **Input validation** with Zod schemas
- **SQL injection prevention** with Prisma
- **XSS prevention** with proper escaping
- **CORS configuration** for API endpoints

### 4. Audit Trail
- **Login/logout events** tracking
- **Password change** notifications
- **Failed login attempts** monitoring
- **Account modification** logging

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- [ ] Upgrade to NextAuth.js v5
- [ ] Set up database schema for auth
- [ ] Configure providers (credentials, Google, Apple)
- [ ] Implement basic login/register forms

### Phase 2: Core Features (Week 2)
- [ ] Email verification system
- [ ] Password reset functionality
- [ ] Profile completion tracking
- [ ] Role-based access control

### Phase 3: Advanced Features (Week 3)
- [ ] Multi-tenant organization support
- [ ] Middleware for route protection
- [ ] tRPC authentication integration
- [ ] Admin user management

### Phase 4: Polish & Security (Week 4)
- [ ] Security hardening
- [ ] Rate limiting implementation
- [ ] Audit logging
- [ ] Testing and validation

This authentication system provides enterprise-grade security while maintaining the user experience standards expected by the Service Dog Standards community.