import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import AddCourse from "@/app/(protected)/school-admin/courses/_components/AddCourse";

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
});
