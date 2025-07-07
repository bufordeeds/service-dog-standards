import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const dashboardRouter = createTRPCRouter({
  // Get dashboard statistics based on user role
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const { role } = ctx.session.user;
      
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        // Admin statistics
        const [totalUsers, totalDogs, pendingReviews] = await Promise.all([
          ctx.prisma.user.count(),
          ctx.prisma.dog.count(),
          ctx.prisma.user.count({ where: { profileComplete: { lt: 100 } } }), // Pending profiles
        ]);

        return {
          totalUsers,
          totalDogs,
          pendingReviews,
          revenue: 12450, // Mock revenue data
          userGrowth: "+12 this month",
          dogGrowth: "+5 this week",
          pendingGrowth: "Requires attention",
          revenueGrowth: "+18% from last month",
        };
      }

      if (role === "TRAINER") {
        // Trainer statistics
        const [clientCount, dogsInTraining] = await Promise.all([
          ctx.prisma.dogUserRelationship.count({
            where: { 
              userId: ctx.session.user.id,
              relationship: "TRAINER",
            },
          }),
          ctx.prisma.dog.count({
            where: {
              status: "IN_TRAINING",
              userRelationships: {
                some: {
                  userId: ctx.session.user.id,
                  relationship: "TRAINER",
                },
              },
            },
          }),
        ]);

        return {
          activeClients: clientCount,
          dogsInTraining,
          sessionsThisMonth: 42, // Mock data
          monthlyIncome: 4200, // Mock data
          clientGrowth: "2 new this month",
          trainingGrowth: "3 graduating soon",
          sessionGrowth: "10 scheduled",
          incomeGrowth: "+$800 pending",
        };
      }

      // Handler statistics
      const [userDogs, profileComplete] = await Promise.all([
        ctx.prisma.dog.count({
          where: { ownerId: ctx.session.user.id },
        }),
        ctx.prisma.user.findUnique({
          where: { id: ctx.session.user.id },
          select: { profileComplete: true },
        }),
      ]);

      return {
        activeDogs: userDogs,
        trainingProgress: profileComplete?.profileComplete || 0,
        teamMembers: 4, // Mock data
        dogGrowth: "+1 this month",
        progressGrowth: "On track",
        teamGrowth: "1 trainer, 3 aides",
      };
    }),

  // Get recent activity for dashboard
  getRecentActivity: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user.id;
      const { role } = ctx.session.user;

      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        // Admin activity - recent system events
        const [recentUsers, recentDogs, recentAgreements] = await Promise.all([
          ctx.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true,
              role: true,
            },
          }),
          ctx.prisma.dog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 2,
            select: {
              id: true,
              name: true,
              registrationNum: true,
              createdAt: true,
              status: true,
              owner: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          }),
          ctx.prisma.agreement.findMany({
            where: { expiresAt: { gte: new Date() } },
            orderBy: { expiresAt: 'asc' },
            take: 2,
            select: {
              id: true,
              type: true,
              expiresAt: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          }),
        ]);

        const activities = [
          ...recentUsers.map(user => ({
            id: `user-${user.id}`,
            type: "registration" as const,
            title: `${user.firstName} ${user.lastName} joined`,
            description: `New ${user.role.toLowerCase()} registration`,
            time: user.createdAt,
            status: "approved" as const,
          })),
          ...recentDogs.map(dog => ({
            id: `dog-${dog.id}`,
            type: "registration" as const,
            title: `${dog.name} registered`,
            description: `Service dog registration #${dog.registrationNum}`,
            time: dog.createdAt,
            status: dog.status === "ACTIVE" ? "approved" as const : "pending" as const,
          })),
          ...recentAgreements.map(agreement => ({
            id: `agreement-${agreement.id}`,
            type: "agreement" as const,
            title: `Agreement expiring soon`,
            description: `${agreement.user.firstName} ${agreement.user.lastName} - ${agreement.type}`,
            time: agreement.expiresAt,
            status: "pending" as const,
          })),
        ];

        return activities
          .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
          .slice(0, 5);
      }

      if (role === "TRAINER") {
        // Trainer activity - client and training related
        const [clientDogs, recentSessions] = await Promise.all([
          ctx.prisma.dog.findMany({
            where: {
              userRelationships: {
                some: {
                  userId: userId,
                  relationship: "TRAINER",
                },
              },
            },
            orderBy: { updatedAt: 'desc' },
            take: 3,
            select: {
              id: true,
              name: true,
              status: true,
              updatedAt: true,
              owner: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          }),
          // Mock session data - would come from training sessions table
          [],
        ]);

        return [
          ...clientDogs.map(dog => ({
            id: `dog-${dog.id}`,
            type: "training" as const,
            title: `${dog.name} progress updated`,
            description: `Training with ${dog.owner.firstName} ${dog.owner.lastName}`,
            time: dog.updatedAt,
            status: dog.status === "ACTIVE" ? "complete" as const : "pending" as const,
          })),
          // Mock training session
          {
            id: "session-1",
            type: "training" as const,
            title: "Training session completed",
            description: "Public access training with Luna",
            time: new Date(Date.now() - 24 * 60 * 60 * 1000),
            status: "complete" as const,
          },
        ].slice(0, 5);
      }

      // Handler activity - personal dogs and agreements
      const [userDogs, userAgreements] = await Promise.all([
        ctx.prisma.dog.findMany({
          where: { ownerId: userId },
          orderBy: { updatedAt: 'desc' },
          take: 3,
          select: {
            id: true,
            name: true,
            registrationNum: true,
            status: true,
            updatedAt: true,
          },
        }),
        ctx.prisma.agreement.findMany({
          where: { userId: userId },
          orderBy: { createdAt: 'desc' },
          take: 2,
          select: {
            id: true,
            type: true,
            createdAt: true,
            expiresAt: true,
            isActive: true,
          },
        }),
      ]);

      return [
        ...userDogs.map(dog => ({
          id: `dog-${dog.id}`,
          type: "registration" as const,
          title: `${dog.name}'s status updated`,
          description: `Service dog registration #${dog.registrationNum}`,
          time: dog.updatedAt,
          status: dog.status === "ACTIVE" ? "approved" as const : "pending" as const,
        })),
        ...userAgreements.map(agreement => ({
          id: `agreement-${agreement.id}`,
          type: "agreement" as const,
          title: agreement.expiresAt && new Date(agreement.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
            ? "Agreement renewal required" 
            : "Agreement accepted",
          description: `SDS ${agreement.type.replace(/_/g, ' ')} agreement`,
          time: agreement.createdAt,
          status: agreement.isActive ? "approved" as const : "pending" as const,
        })),
      ].slice(0, 5);
    }),

  // Get quick actions based on user role
  getQuickActions: protectedProcedure
    .query(async ({ ctx }) => {
      const { role } = ctx.session.user;
      
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        return [
          {
            title: "User Management",
            description: "Manage users and permissions",
            href: "/admin/users",
            icon: "Users",
          },
          {
            title: "System Settings",
            description: "Configure system settings",
            href: "/admin/settings",
            icon: "Settings",
          },
          {
            title: "Content Review",
            description: "Review flagged content",
            href: "/admin/review",
            icon: "AlertCircle",
          },
          {
            title: "Analytics",
            description: "View system analytics",
            href: "/admin/analytics",
            icon: "BarChart",
          },
        ];
      }

      if (role === "TRAINER") {
        return [
          {
            title: "New Client",
            description: "Add a new client",
            href: "/trainer/clients/new",
            icon: "UserPlus",
          },
          {
            title: "Schedule Session",
            description: "Schedule a training session",
            href: "/trainer/sessions/new",
            icon: "Calendar",
          },
          {
            title: "Training Plans",
            description: "Manage training plans",
            href: "/trainer/plans",
            icon: "BookOpen",
          },
          {
            title: "My Profile",
            description: "Update trainer profile",
            href: "/trainer/profile",
            icon: "User",
          },
        ];
      }

      return [
        {
          title: "Register Dog",
          description: "Register a new service dog",
          href: "/dashboard/dogs/register",
          icon: "Plus",
        },
        {
          title: "View Agreements",
          description: "View and manage agreements",
          href: "/dashboard/agreements",
          icon: "FileText",
        },
        {
          title: "Find Trainers",
          description: "Connect with trainers",
          href: "/trainers",
          icon: "Users",
        },
        {
          title: "My Dogs",
          description: "Manage your dogs",
          href: "/dashboard/dogs",
          icon: "Heart",
        },
      ];
    }),
});