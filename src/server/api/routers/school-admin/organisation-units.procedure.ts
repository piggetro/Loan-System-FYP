import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";

export const organisationUnitsRouter = createTRPCRouter({
    getAllOrganizationUnits: protectedProcedure.query(async ({ ctx }) => {
        try {
            return await ctx.db.organizationUnit.findMany();
        } catch (err) {
            console.log(err);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
    }),
    updateOrganizationUnit: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.organizationUnit.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteOrganizationUnit: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.organizationUnit.delete({
          where: {
            id: input.id,
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  addOrganizationUnit: protectedProcedure
    .input(
      z.object({ name: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.organizationUnit.create({
          data: {
            name: input.name,
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});