# Service Dog Standards - Vue to Next.js Migration Plan

## Executive Summary

This document outlines a comprehensive plan to migrate the Service Dog Standards Vue.js application to a modern Next.js architecture. Based on analysis of the existing Vue app and requirements, we recommend building on the existing T3 stack foundation with significant architectural enhancements.

## 1. Technology Stack & Architecture

### Recommended Stack (Building on T3)
```
Frontend:
- Next.js 14+ (App Router) - for better layouts, streaming, and server components
- TypeScript - already in place
- Tailwind CSS + shadcn/ui - for consistent, accessible components
- React Hook Form + Zod - form handling with validation
- TanStack Query - data fetching (already included)
- Zustand - client state management for cart, UI state

Backend:
- tRPC - already configured, excellent for type-safe APIs
- Prisma - upgrade to PostgreSQL from SQLite
- NextAuth.js v5 - upgrade for better features
- Stripe SDK - payment processing
- AWS S3/Cloudinary - file storage
- Resend/SendGrid - transactional emails
- Bull/BullMQ - job queues for email, exports

Infrastructure:
- Vercel - deployment platform
- PostgreSQL (Vercel Postgres or Supabase)
- Redis (Upstash) - caching, sessions, queues
- Cloudflare R2/AWS S3 - file storage
```

### Architecture Decisions

1. **App Router vs Pages Router**: Migrate to App Router for:
   - Better layouts and nested routing
   - Server Components for improved performance
   - Streaming and suspense boundaries
   - Parallel data fetching

2. **Database**: PostgreSQL over SQLite for:
   - Production-ready performance
   - Better concurrent user support
   - Advanced queries and indexes
   - JSON field support

3. **Multi-tenant Architecture**:
   - Subdomain routing (sds.domain.com, esa.domain.com)
   - Environment-based theming
   - Shared component library
   - Database schema with organization_id

## 2. Database Schema Design

### Core Entities

```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  subdomain String   @unique
  theme     Json
  settings  Json
  createdAt DateTime @default(now())
  
  users     User[]
  dogs      Dog[]
  orders    Order[]
}

model User {
  id               String   @id @default(cuid())
  email            String   @unique
  emailVerified    DateTime?
  hashedPassword   String?
  role             UserRole @default(HANDLER)
  accountType      AccountType
  profileComplete  Float    @default(0) // 0-100 percentage
  
  // Profile fields
  firstName        String?
  lastName         String?
  phone            String?
  address          Json?
  profileImage     String?
  bio              Text?
  
  // Relationships
  organizationId   String
  organization     Organization @relation(fields: [organizationId], references: [id])
  
  dogs             Dog[]
  handlesDogs      DogHandler[]
  trainsDogs       DogTrainer[]
  delegatedAccess  DelegatedAccess[]
  orders           Order[]
  agreements       Agreement[]
  
  // Trainer specific
  trainerProfile   TrainerProfile?
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Dog {
  id               String   @id @default(cuid())
  registrationNum  String   @unique
  name             String
  breed            String?
  birthDate        DateTime?
  status           DogStatus @default(ACTIVE)
  profileImage     String?
  
  // Relationships
  ownerId          String
  owner            User     @relation(fields: [ownerId], references: [id])
  handlers         DogHandler[]
  trainers         DogTrainer[]
  documents        Document[]
  achievements     Achievement[]
  
  organizationId   String
  organization     Organization @relation(fields: [organizationId], references: [id])
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Agreement {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id])
  type             AgreementType
  version          String
  acceptedAt       DateTime
  expiresAt        DateTime
  content          Json     // Store agreement snapshot
}

model Order {
  id               String   @id @default(cuid())
  orderNumber      String   @unique
  userId           String
  user             User     @relation(fields: [userId], references: [id])
  
  items            OrderItem[]
  
  subtotal         Decimal
  tax              Decimal
  shipping         Decimal
  total            Decimal
  
  status           OrderStatus
  paymentIntentId  String?
  
  shippingAddress  Json
  billingAddress   Json
  
  organizationId   String
  organization     Organization @relation(fields: [organizationId], references: [id])
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

// Enums
enum UserRole {
  HANDLER
  TRAINER
  ADMIN
  SUPER_ADMIN
}

enum AccountType {
  INDIVIDUAL
  PROFESSIONAL
  ORGANIZATION
}

enum DogStatus {
  ACTIVE
  IN_TRAINING
  RETIRED
  WASHED_OUT
  IN_MEMORIAM
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}
```

## 3. Authentication & Authorization

### Authentication Strategy
1. **Upgrade to NextAuth.js v5** for:
   - Better TypeScript support
   - Edge runtime compatibility
   - Enhanced security features

2. **Providers**:
   - Email/Password (credentials)
   - Google OAuth
   - Apple OAuth (for mobile users)
   - Magic links for passwordless

3. **Authorization Levels**:
   ```typescript
   // Middleware for route protection
   export const authConfig = {
     pages: {
       signIn: '/login',
       error: '/auth/error',
     },
     callbacks: {
       authorized({ auth, request: { nextUrl } }) {
         const isLoggedIn = !!auth?.user;
         const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
         const isAdmin = auth?.user?.role === 'ADMIN';
         
         if (isOnDashboard) {
           if (!isLoggedIn) return false;
           if (nextUrl.pathname.startsWith('/dashboard/admin') && !isAdmin) {
             return Response.redirect(new URL('/dashboard'));
           }
         }
         return true;
       },
     },
   };
   ```

## 4. UI/UX Architecture

### Component Structure
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages layout
│   ├── (public)/          # Public pages layout  
│   ├── dashboard/         # Protected dashboard
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui base components
│   ├── dashboard/         # Dashboard-specific components
│   │   ├── AgreementCard.tsx
│   │   ├── CompletionGauge.tsx
│   │   └── DogsListCard.tsx
│   ├── forms/             # Form components
│   ├── shop/              # E-commerce components
│   └── shared/            # Shared components
├── lib/                   # Utilities
├── hooks/                 # Custom React hooks
└── server/                # Server-side code
```

### Key UI Features Implementation

1. **Dashboard Cards/Pods**:
   ```tsx
   // Using shadcn/ui Card component
   <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
     <CardHeader>
       <CardTitle>SDS Agreement</CardTitle>
     </CardHeader>
     <CardContent>
       {agreement ? <CountdownTimer /> : <AcceptAgreementButton />}
     </CardContent>
   </Card>
   ```

2. **Mobile-First Design**:
   - Responsive grid system
   - Touch-optimized interactions
   - Bottom navigation for mobile
   - Progressive disclosure patterns

3. **Animations**:
   - Framer Motion for page transitions
   - Lottie for success animations
   - CSS animations for micro-interactions

## 5. Feature Implementation Plan

### Phase 1: Foundation (Weeks 1-3)
- [ ] Upgrade Next.js to 14+ with App Router
- [ ] Set up PostgreSQL with updated Prisma schema
- [ ] Implement authentication with NextAuth.js v5
- [ ] Create base UI components with shadcn/ui
- [ ] Set up file upload to S3/Cloudinary

### Phase 2: Core Features (Weeks 4-6)
- [ ] User registration and profile management
- [ ] Dashboard with agreement, completion gauge, dogs list
- [ ] Service dog registration and management
- [ ] Public profile pages (handler/trainer/team)
- [ ] Basic search functionality

### Phase 3: E-commerce (Weeks 7-8)
- [ ] Product catalog with Stripe Products API
- [ ] Shopping cart with Zustand
- [ ] Checkout flow with Stripe Checkout
- [ ] Order management and history
- [ ] Digital downloads (PDFs, wallet cards)

### Phase 4: Advanced Features (Weeks 9-10)
- [ ] Trainer directory with search/filters
- [ ] Delegated access system
- [ ] Email notifications with templates
- [ ] Agreement expiration tracking
- [ ] Multi-organization support

### Phase 5: Polish & Launch (Weeks 11-12)
- [ ] Performance optimization
- [ ] SEO implementation
- [ ] Analytics integration
- [ ] Testing and bug fixes
- [ ] Documentation

## 6. Migration Strategy

### Data Migration
1. Export Vue app data from MongoDB
2. Transform data to match new schema
3. Import to PostgreSQL with validation
4. Verify data integrity

### Incremental Migration Path
1. **Option A: Parallel Development**
   - Build Next.js app alongside Vue app
   - Gradually migrate features
   - Use feature flags for rollout

2. **Option B: Clean Rebuild** (Recommended)
   - Start fresh with new architecture
   - Import data once core features ready
   - Faster development, cleaner codebase

### Risk Mitigation
- Maintain Vue app during transition
- Regular data backups
- Staged rollout to users
- Comprehensive testing plan

## 7. Technical Considerations

### Performance
- Server Components for static content
- Image optimization with next/image
- API response caching
- Database query optimization

### Security
- Input validation with Zod
- CSRF protection
- Rate limiting
- Secure file uploads
- PCI compliance for payments

### Scalability
- Edge functions for global performance
- Database connection pooling
- CDN for static assets
- Queue system for background jobs

## 8. Estimated Timeline

Total Duration: 12 weeks

- Foundation & Setup: 3 weeks
- Core Features: 3 weeks  
- E-commerce: 2 weeks
- Advanced Features: 2 weeks
- Testing & Launch: 2 weeks

## 9. Recommendation

Given the complexity and the current state of both codebases, I recommend:

1. **Start Fresh** with the Next.js T3 stack as the foundation
2. **Upgrade to App Router** for better architecture
3. **Use PostgreSQL** from the start
4. **Implement features incrementally** with clear phases
5. **Focus on mobile-first** design throughout

The existing Next.js setup provides a good starting point, but significant architectural decisions need to be made early to support all requirements effectively.