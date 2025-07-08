import { NextResponse } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "~/server/auth.config"

// Define protected routes and their required roles
const protectedRoutes = {
  // Dashboard routes - require authentication
  "/dashboard": [],
  "/dashboard/profile": [],
  "/dashboard/settings": [],
  "/dashboard/dogs": [],
  "/dashboard/agreements": [],
  
  // Handler-specific routes
  "/dashboard/trainers": ["HANDLER"],
  
  // Trainer/Aide routes
  "/dashboard/clients": ["TRAINER", "AIDE"],
  
  // Analytics routes - trainers and admins
  "/dashboard/analytics": ["TRAINER", "ADMIN", "SUPER_ADMIN"],
  
  // Admin routes
  "/dashboard/admin": ["ADMIN", "SUPER_ADMIN"],
  "/dashboard/admin/users": ["SUPER_ADMIN"],
  "/dashboard/admin/organizations": ["SUPER_ADMIN"],
  
  // API routes that require authentication
  "/api/dogs": [],
  "/api/profile": [],
  "/api/agreements": [],
  "/api/admin": ["ADMIN", "SUPER_ADMIN"],
}

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/error",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/trainers", // Public trainer directory
  "/dogs", // Public dog directory
]

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  )
}

function getRequiredRoles(pathname: string): string[] {
  // Find the most specific route match
  const matchedRoute = Object.keys(protectedRoutes)
    .sort((a, b) => b.length - a.length) // Sort by length (most specific first)
    .find(route => pathname === route || pathname.startsWith(route + "/"))
  
  return matchedRoute ? protectedRoutes[matchedRoute as keyof typeof protectedRoutes] : []
}

function hasRequiredRole(userRole: string | undefined, requiredRoles: string[]): boolean {
  if (requiredRoles.length === 0) return true // No specific role required
  if (!userRole) return false
  return requiredRoles.includes(userRole)
}

const { auth } = NextAuth(authConfig)

export default auth(function middleware(req) {
    const { pathname } = req.nextUrl
    const session = req.auth
    const token = session?.user
    
    // Allow public routes
    if (isPublicRoute(pathname)) {
      return NextResponse.next()
    }
    
    // Check if route requires authentication
    const requiredRoles = getRequiredRoles(pathname)
    const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
      pathname === route || pathname.startsWith(route + "/")
    )
    
    if (isProtectedRoute) {
      // If no token, redirect to login
      if (!token) {
        const loginUrl = new URL("/auth/login", req.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
      }
      
      // Check role permissions
      if (!hasRequiredRole(token?.role, requiredRoles)) {
        // Redirect to dashboard with error
        const dashboardUrl = new URL("/dashboard", req.url)
        dashboardUrl.searchParams.set("error", "insufficient-permissions")
        return NextResponse.redirect(dashboardUrl)
      }
    }
    
    return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public|assets).*)",
  ],
}