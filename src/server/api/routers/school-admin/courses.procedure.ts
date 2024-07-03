import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { createId } from "@paralleldrive/cuid2";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export const coursesRouter = createTRPCRouter({
  getAllCourses: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.selectFrom("Course").selectAll().execute();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  deleteCourse: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.deleteFrom("Course").where("id", "=", input.id).execute();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getEquipments: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db
        .selectFrom("Equipment")
        .select(["id", "name"])
        .execute();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  addCourse: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1),
        equipments: z.array(z.string().min(1)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const course = await ctx.db.transaction().execute(async (trx) => {
          const course = await trx
            .insertInto("Course")
            .values({
              id: createId(),
              name: input.name,
              code: input.code,
              active: true,
            })
            .returningAll()
            .executeTakeFirstOrThrow();
          input.equipments.length &&
            (await trx
              .insertInto("EquipmentOnCourses")
              .values(
                input.equipments.map((equipment) => ({
                  courseId: course.id,
                  equipmentId: equipment,
                })),
              )
              .execute());
          return course;
        });
        return course;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getCourse: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const data = await ctx.db
          .selectFrom("Course")
          .select((eb) => [
            "id",
            "name",
            "code",
            "active",
            jsonArrayFrom(
              eb
                .selectFrom("EquipmentOnCourses")
                .leftJoin(
                  "Equipment",
                  "EquipmentOnCourses.equipmentId",
                  "Equipment.id",
                )
                .select(["Equipment.id", "Equipment.name"])
                .where("EquipmentOnCourses.courseId", "=", input.id),
            ).as("equipments"),
          ])
          .where("Course.id", "=", input.id)
          .executeTakeFirst();

        return {
          course: {
            id: data?.id ?? "",
            name: data?.name ?? "",
            code: data?.code ?? "",
            active: data?.active ?? true,
          },
          equipments:
            data?.equipments.map((equipment) => ({
              id: equipment.id ?? "",
              name: equipment.name ?? "",
            })) ?? [],
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  removeEquipmentFromCourse: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        equipmentId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .deleteFrom("EquipmentOnCourses")
          .where("courseId", "=", input.id)
          .where("equipmentId", "=", input.equipmentId)
          .execute();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  addEquipmentToCourse: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        equipmentIds: z.array(z.string().min(1)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .insertInto("EquipmentOnCourses")
          .values(
            input.equipmentIds.map((equipmentId) => ({
              courseId: input.id,
              equipmentId,
            })),
          )
          .execute();

        return await ctx.db
          .selectFrom("Equipment")
          .select(["id", "name"])
          .where("id", "in", input.equipmentIds)
          .execute();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  updateCourse: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        code: z.string().min(1),
        active: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .updateTable("Course")
          .set({
            name: input.name,
            code: input.code,
            active: input.active,
          })
          .where("id", "=", input.id)
          .returningAll()
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getAvailableEquipmentForCourse: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .selectFrom("Equipment")
          .select(["id", "name"])
          .where(
            "id",
            "not in",
            ctx.db
              .selectFrom("EquipmentOnCourses")
              .select("equipmentId")
              .where("courseId", "=", input.id),
          )
          .execute();
      } catch (err) {
        console.log(err);
      }
    }),
});
