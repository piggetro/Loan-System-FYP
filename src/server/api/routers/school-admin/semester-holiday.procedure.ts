import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { sql } from "kysely";

export const semesterHolidayRouter = createTRPCRouter({
  getSemester: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db
        .selectFrom("Semesters")
        .select([
          "id",
          "name",
          "startDate",
          "endDate",
          sql<string>`DATE_PART('day', "endDate" - "startDate") + 1`.as(
            "numberOfDays",
          ),
        ])
        .orderBy("Semesters.startDate", "desc")
        .execute();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  addSemester: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .insertInto("Semesters")
          .values({
            id: createId(),
            name: input.name,
            startDate: input.startDate,
            endDate: input.endDate,
          })
          .returning([
            "id",
            "name",
            "startDate",
            "endDate",
            sql<string>`DATE_PART('day', "endDate" - "startDate") + 1`.as(
              "numberOfDays",
            ),
          ])
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  updateSemester: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .updateTable("Semesters")
          .set({
            name: input.name,
            startDate: input.startDate,
            endDate: input.endDate,
          })
          .where("id", "=", input.id)
          .returning([
            "id",
            "name",
            "startDate",
            "endDate",
            sql<string>`DATE_PART('day', "endDate" - "startDate") + 1`.as(
              "numberOfDays",
            ),
          ])
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteSemester: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .deleteFrom("Semesters")
          .where("id", "=", input.id)
          .executeTakeFirstOrThrow();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getHoliday: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db
        .selectFrom("Holiday")
        .select([
          "id",
          "name",
          "startDate",
          "endDate",
          sql<string>`DATE_PART('day', "endDate" - "startDate") + 1`.as(
            "numberOfDays",
          ),
        ])
        .orderBy("startDate", "desc")
        .execute();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  addHoliday: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const endDate = new Date(input.endDate);

        endDate.setHours(23, 59, 59, 999);
        return await ctx.db
          .insertInto("Holiday")
          .values({
            id: createId(),
            name: input.name,
            startDate: input.startDate,
            endDate,
          })
          .returning([
            "id",
            "name",
            "startDate",
            "endDate",
            sql<string>`DATE_PART('day', "endDate" - "startDate") + 1`.as(
              "numberOfDays",
            ),
          ])
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  updateHoliday: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const endDate = new Date(input.endDate);

        endDate.setHours(23, 59, 59, 999);
        return await ctx.db
          .updateTable("Holiday")
          .set({
            name: input.name,
            startDate: input.startDate,
            endDate,
          })
          .where("id", "=", input.id)
          .returning([
            "id",
            "name",
            "startDate",
            "endDate",
            sql<string>`DATE_PART('day', "endDate" - "startDate") + 1`.as(
              "numberOfDays",
            ),
          ])
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteHoliday: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .deleteFrom("Holiday")
          .where("id", "=", input.id)
          .executeTakeFirstOrThrow();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
