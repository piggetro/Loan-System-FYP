import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";

export const organisationUnitsRouter = createTRPCRouter({
  getAllOrganizationUnits: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.selectFrom("OrganizationUnit").selectAll().execute();
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
        return await ctx.db
          .updateTable("OrganizationUnit")
          .set({
            name: input.name,
          })
          .where("id", "=", input.id)
          .returningAll()
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteOrganizationUnit: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .deleteFrom("OrganizationUnit")
          .where("id", "=", input.id)
          .execute();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  addOrganizationUnit: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .insertInto("OrganizationUnit")
          .values({
            id: createId(),
            name: input.name,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
