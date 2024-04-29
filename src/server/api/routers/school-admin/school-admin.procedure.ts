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
});
