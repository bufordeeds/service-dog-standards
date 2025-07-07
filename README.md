# Service Dog Standards - Next.js Platform

> A modern, mobile-first platform for service dog registration, certification, and community management. Built with Next.js 14, TypeScript, and PostgreSQL.

## 🎯 Project Overview

Service Dog Standards (SDS) is transforming from a Vue.js application into a comprehensive Next.js platform that provides professional service dog registration, trainer directories, e-commerce, and community features. The platform supports multi-tenant architecture for launching different brands (SDS, ESA Standards, etc.).

## ✨ Key Features

### 🏠 Professional Homepage
- Beautiful, mobile-responsive design with SDS branding
- Real product showcases and feature highlights
- Professional registration call-to-actions
- SEO optimized with proper meta tags

### 🔐 Enterprise Authentication System
- **NextAuth.js v4** with database sessions
- **Multi-provider support**: Email/password, Google OAuth, Apple OAuth
- **Role-based access control**: Handler, Trainer, Aide, Admin, Super Admin
- **Email verification** and password reset workflows
- **Multi-tenant organization** support

### 📊 Interactive Dashboard System
- **Agreement tracking** with 4-year countdown timers
- **Profile completion gauge** with step-by-step guidance
- **Registered dogs management** with status indicators
- **Role-specific dashboards** for different user types
- **Mobile-first responsive design**

### 🐕 Comprehensive Dog Registry
- Unique SDS registration number generation
- Multi-user relationships (handler, trainer, aide)
- Training status tracking and milestones
- Public/private profile visibility controls
- Document storage for certificates and records

### 👥 User & Trainer Profiles
- Public trainer directory with search/filtering
- Custom trainer URLs (e.g., `/trainers/sarah-wilson`)
- Business information and credentials display
- Client testimonials and review system
- Verification badges and certifications

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Hook Form** with Zod validation
- **Framer Motion** for animations

### Backend
- **tRPC** for type-safe APIs
- **Prisma ORM** with PostgreSQL
- **NextAuth.js** for authentication
- **Cloudflare R2** for file storage
- **Resend** for email services

### Database
- **PostgreSQL** (Neon/Vercel Postgres)
- **22-table comprehensive schema**
- **Multi-tenant architecture**
- **Audit trails and compliance tracking**

### Infrastructure
- **Vercel** for deployment
- **GitHub Actions** for CI/CD
- **MCP PostgreSQL Server** for development assistance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- PostgreSQL database (Neon recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/bufordeeds/service-dog-standards.git
cd service-dog-standards

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and service credentials

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Environment Setup

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgres://..."
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# Authentication
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
APPLE_CLIENT_ID="your-apple-client-id"
APPLE_CLIENT_SECRET="your-apple-client-secret"

# File Storage (optional)
R2_ACCOUNT_ID="your-cloudflare-r2-account"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="your-bucket-name"
NEXT_PUBLIC_R2_BUCKET_URL="https://your-bucket-url"

# Email Service (optional)
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@servicedogstandards.com"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_DEFAULT_ORG="sds"
```

## 📋 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Database Management
```bash
npm run db:migrate   # Run Prisma migrations
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:reset     # Reset database (caution!)
npm run db:seed      # Seed with sample data
```

### Development Assistance
```bash
npm run mcp:postgres # Start PostgreSQL MCP server for Claude assistance
```

## 🏗️ Project Structure

```
service-dog-standards/
├── docs/                          # Comprehensive project documentation
│   ├── ROADMAP.md                 # Development phases and timeline
│   ├── DATABASE_SCHEMA.md         # Complete database design
│   ├── AUTHENTICATION_PLAN.md     # Auth system architecture
│   ├── PHASE3_DASHBOARD_PLAN.md   # Dashboard implementation plan
│   └── POSTGRES_SETUP_COMPLETE.md # Database setup documentation
├── prisma/
│   ├── schema.prisma              # Database schema definition
│   └── migrations/                # Database migration history
├── public/                        # Static assets and SDS branding
├── scripts/                       # Development and deployment scripts
├── src/
│   ├── app/                       # Next.js 14 App Router
│   │   ├── api/                   # API routes
│   │   ├── auth/                  # Authentication pages
│   │   ├── dashboard/             # Protected dashboard pages
│   │   └── layout.tsx             # Root layout with providers
│   ├── components/
│   │   ├── layout/                # Layout components
│   │   └── ui/                    # shadcn/ui component library
│   ├── lib/                       # Utilities and configurations
│   ├── server/                    # Backend logic and tRPC routers
│   └── styles/                    # Global styles and Tailwind config
└── tailwind.config.ts             # Tailwind CSS configuration
```

## 🗄️ Database Schema

The application uses a comprehensive 22-table PostgreSQL schema supporting:

### Core System
- **Organizations**: Multi-tenant support
- **Users**: Role-based user management
- **Sessions**: NextAuth.js session handling

### Dog Registry
- **Dogs**: Service dog profiles and registry
- **DogUserRelationships**: Handler/trainer connections
- **Achievements**: Training milestones and certifications

### E-commerce
- **Items**: Product catalog
- **Orders**: Order management and fulfillment
- **Carts**: Shopping cart functionality
- **Donations**: Support and donation processing

### Content Management
- **Images**: User and dog photos
- **Documents**: Certificates and training records
- **Agreements**: Legal compliance tracking

### Administration
- **DelegatedAccess**: Account sharing permissions
- **FlagReports**: Content moderation system

## 🔐 Authentication & Authorization

### Supported Authentication Methods
- **Email/Password**: Standard credential authentication
- **Google OAuth**: Social login integration
- **Apple OAuth**: iOS and macOS integration

### Role-Based Access Control
- **Handler**: Service dog owners and users
- **Trainer**: Professional dog trainers
- **Aide**: Assistants and helpers
- **Admin**: Organization administrators
- **Super Admin**: Platform administrators

### Security Features
- bcrypt password hashing
- HTTP-only secure session cookies
- Email verification workflow
- Password reset with secure tokens
- Rate limiting on authentication attempts

## 📱 Dashboard Features

### Agreement Management
- SDS Training & Behavior Standards tracking
- 4-year agreement countdown timers
- Expiration warnings and notifications
- One-click renewal workflow

### Profile Completion
- Interactive completion gauge (0-100%)
- Step-by-step onboarding guidance
- Profile photo and information management
- Privacy controls and visibility settings

### Dog Registry Management
- Service dog registration and profiles
- Status tracking (Active, Training, Retired, etc.)
- Multi-user team management
- Training milestone tracking

### Role-Specific Features
- **Trainers**: Client management, business profiles
- **Handlers**: Dog care tracking, team coordination
- **Admins**: User management, system oversight

## 🌐 API Architecture

### tRPC Integration
- Type-safe end-to-end APIs
- Real-time type synchronization
- Automatic API documentation
- Built-in error handling

### Key API Routers
- **auth**: Authentication and user management
- **dogs**: Dog registry and relationships
- **agreements**: Compliance and legal tracking
- **organizations**: Multi-tenant management

## 🚢 Deployment

### Vercel Platform
- Automated deployments from main branch
- Environment variable management
- Edge function optimization
- Global CDN distribution

### Production Configuration
```bash
# Set environment variables in Vercel
vercel env add NEXTAUTH_SECRET production
vercel env add DATABASE_URL production

# Deploy to production
vercel --prod
```

## 📊 Project Roadmap

### ✅ Phase 1: Foundation (COMPLETED)
- Next.js 14 App Router setup
- shadcn/ui component library
- SDS branding and homepage
- Basic project architecture

### ✅ Phase 2: Database & Authentication (COMPLETED)
- PostgreSQL database with comprehensive schema
- NextAuth.js authentication system
- Role-based access control
- User registration and management

### 🚧 Phase 3: Dashboard & Core Features (IN PROGRESS)
- Interactive dashboard with "pods" system
- User profile management
- Service dog registry
- Agreement tracking and compliance

### 📋 Phase 4: E-commerce & Orders (PLANNED)
- Product catalog and shopping cart
- Stripe payment integration
- Order management and fulfillment
- Digital product delivery

### 👥 Phase 5: Community Features (PLANNED)
- Trainer directory and search
- Public dog profiles
- Delegation and team management
- Achievement and certification system

### 🏢 Phase 6: Admin & Management (PLANNED)
- Administrative dashboard
- Content moderation
- Analytics and reporting
- Multi-tenant brand management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write tests for new features
- Update documentation as needed

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Development Roadmap](docs/ROADMAP.md)**: Complete project timeline and phases
- **[Database Schema](docs/DATABASE_SCHEMA.md)**: Detailed database design
- **[Authentication Plan](docs/AUTHENTICATION_PLAN.md)**: Security architecture
- **[Dashboard Plan](docs/PHASE3_DASHBOARD_PLAN.md)**: Dashboard implementation guide
- **[PostgreSQL Setup](docs/POSTGRES_SETUP_COMPLETE.md)**: Database configuration

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Test database connection
npm run db:studio
curl http://localhost:3000/api/test-db
```

**Authentication Problems**
```bash
# Verify environment variables
echo $NEXTAUTH_SECRET
echo $NEXTAUTH_URL
```

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Development Support
- **MCP PostgreSQL Server**: Run `npm run mcp:postgres` for database assistance
- **Prisma Studio**: Visual database browser at `npm run db:studio`
- **API Testing**: Use `/api/test-db` and `/api/test-auth` endpoints

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [T3 Stack](https://create.t3.gg/) principles
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database hosting by [Neon](https://neon.tech/)
- Deployment on [Vercel](https://vercel.com/)

## 📞 Support

For support and questions:
- **Issues**: [GitHub Issues](https://github.com/bufordeeds/service-dog-standards/issues)
- **Documentation**: See `/docs` directory
- **Email**: support@servicedogstandards.com

---

**Current Status**: Phase 3 Implementation - Dashboard & Core Features  
**Last Updated**: January 2025  
**Version**: 3.0.0-beta