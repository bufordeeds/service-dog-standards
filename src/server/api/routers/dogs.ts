import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const dogsRouter = createTRPCRouter({
  // Get user's registered dogs
  getUserDogs: protectedProcedure
    .query(async ({ ctx }) => {
      const dogs = await ctx.prisma.dog.findMany({
        where: { ownerId: ctx.session.user.id },
        include: {
          userRelationships: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          achievements: {
            orderBy: { earnedAt: 'desc' },
            take: 3, // Get latest 3 achievements
          },
          images: {
            where: { type: 'PROFILE' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return dogs.map(dog => ({
        ...dog,
        profileImage: dog.images[0]?.url ?? dog.profileImage,
        teamMembers: dog.userRelationships.map(rel => ({
          id: rel.user.id,
          name: `${rel.user.firstName ?? ''} ${rel.user.lastName ?? ''}`.trim(),
          email: rel.user.email,
          role: rel.user.role,
          relationship: rel.relationship,
          permissions: {
            canView: rel.canViewProfile,
            canEdit: rel.canEditProfile,
            canManage: rel.canManageDogs,
          },
        })),
        recentAchievements: dog.achievements,
      }));
    }),

  // Get single dog details
  getDog: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const dog = await ctx.prisma.dog.findFirst({
        where: {
          id: input.id,
          OR: [
            { ownerId: ctx.session.user.id },
            {
              userRelationships: {
                some: {
                  userId: ctx.session.user.id,
                  canViewProfile: true,
                },
              },
            },
          ],
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
            },
          },
          userRelationships: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true,
                  profileImage: true,
                },
              },
            },
          },
          achievements: {
            orderBy: { earnedAt: 'desc' },
          },
          images: true,
          documents: {
            orderBy: { uploadedAt: 'desc' },
          },
        },
      });

      if (!dog) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dog not found or you don't have permission to view it",
        });
      }

      return dog;
    }),

  // Update dog status
  updateDogStatus: protectedProcedure
    .input(z.object({
      dogId: z.string(),
      status: z.enum(["ACTIVE", "IN_TRAINING", "RETIRED", "WASHED_OUT", "IN_MEMORIAM"]),
      statusReason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the dog or has management permissions
      const dog = await ctx.prisma.dog.findFirst({
        where: {
          id: input.dogId,
          OR: [
            { ownerId: ctx.session.user.id },
            {
              userRelationships: {
                some: {
                  userId: ctx.session.user.id,
                  canManageDogs: true,
                },
              },
            },
          ],
        },
      });

      if (!dog) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this dog",
        });
      }

      const updatedDog = await ctx.prisma.dog.update({
        where: { id: input.dogId },
        data: {
          status: input.status,
          statusReason: input.statusReason,
          statusDate: new Date(),
        },
      });

      return updatedDog;
    }),

  // Get dog statistics for dashboard
  getDogStats: protectedProcedure
    .query(async ({ ctx }) => {
      const dogs = await ctx.prisma.dog.findMany({
        where: { ownerId: ctx.session.user.id },
        select: { status: true },
      });

      const stats = {
        total: dogs.length,
        active: dogs.filter(d => d.status === 'ACTIVE').length,
        inTraining: dogs.filter(d => d.status === 'IN_TRAINING').length,
        retired: dogs.filter(d => d.status === 'RETIRED').length,
        washedOut: dogs.filter(d => d.status === 'WASHED_OUT').length,
        inMemoriam: dogs.filter(d => d.status === 'IN_MEMORIAM').length,
      };

      return stats;
    }),
});