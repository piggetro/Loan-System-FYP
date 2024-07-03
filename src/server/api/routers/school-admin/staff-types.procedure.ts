import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";

export const staffTypesRouter = createTRPCRouter({
  getAllStaffTypes: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.selectFrom("StaffType").selectAll().execute();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  updateStaffType: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .updateTable("StaffType")
          .set({
            name: input.name,
          })
          .returningAll()
          .where("id", "=", input.id)
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteStaffType: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .deleteFrom("StaffType")
          .where("id", "=", input.id)
          .execute();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  addStaffType: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .insertInto("StaffType")
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
