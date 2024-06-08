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
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
