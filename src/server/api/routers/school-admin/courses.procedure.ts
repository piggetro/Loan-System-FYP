import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";

export const coursesRouter = createTRPCRouter({
  getAllCourses: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.course.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          active: true,
        },
      });
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  deleteCourse: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.course.delete({
          where: {
            id: input.id,
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getEquipments: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.equipment.findMany({
        select: {
          id: true,
          name: true,
        },
      });
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
        const course = await ctx.db.course.create({
          data: {
            name: input.name,
            code: input.code,
            active: true,
            equipment: {
              create: input.equipments.map((equipment) => ({
                equipment: {
                  connect: {
                    id: equipment,
                  },
                },
              })),
            },
          },
        });
        return {
          id: course.id,
          name: course.name,
          code: course.code,
          active: course.active,
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getCourse: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const data = await ctx.db.course.findUnique({
          where: {
            id: input.id,
          },
          select: {
            id: true,
            name: true,
            code: true,
            active: true,
            equipment: {
              select: {
                equipment: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });
        return {
          course: {
            id: data?.id ?? "",
            name: data?.name ?? "",
            code: data?.code ?? "",
            active: data?.active ?? false,
          },
          equipments:
            data?.equipment.map((equipment) => equipment.equipment) ?? [],
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
        return await ctx.db.equipmentOnCourses.delete({
          where: {
            equipmentId_courseId: {
              equipmentId: input.equipmentId,
              courseId: input.id,
            },
          },
        });
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
        await ctx.db.equipmentOnCourses.createMany({
          data: input.equipmentIds.map((equipmentId) => ({
            courseId: input.id,
            equipmentId,
          })),
        });
        return await ctx.db.equipment.findMany({
          where: {
            course: {
              some: {
                courseId: input.id,
              },
            },
          },
          select: {
            id: true,
            name: true,
          },
        });
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
        return await ctx.db.course.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            code: input.code,
            active: input.active,
          },
        });
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
        return await ctx.db.equipment.findMany({
          where: {
            NOT: {
              course: {
                some: {
                  courseId: input.id,
                },
              },
            },
          },
          select: {
            id: true,
            name: true,
          },
        });
      } catch (err) {
        console.log(err);
      }
    }),
});
