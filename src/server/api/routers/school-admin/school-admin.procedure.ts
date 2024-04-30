import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";

export const schoolAdminRouter = createTRPCRouter({
  getAccessRights: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.accessRights.findMany();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  updateAccessRight: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        pageName: z.string().min(1),
        pageLink: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.accessRights.update({
          where: {
            id: input.id,
          },
          data: {
            pageName: input.pageName,
            pageLink: input.pageLink,
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteAccessRight: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.accessRights.delete({
          where: {
            id: input.id,
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  addAccessRight: protectedProcedure
    .input(
      z.object({ pageName: z.string().min(1), pageLink: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.accessRights.create({
          data: {
            pageName: input.pageName,
            pageLink: input.pageLink,
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getAllRoles: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db.role.findMany({
        select: {
          id: true,
          role: true,
          _count: {
            select: {
              accessRights: true,
              users: true,
            },
          },
        },
      });
      return data.map((role) => ({
        id: role.id,
        role: role.role,
        accessRightsCount: role._count.accessRights,
        usersCount: role._count.users,
      }));
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
