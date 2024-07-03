import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { Argon2id } from "oslo/password";

export const profileRouter = createTRPCRouter({
  changePassword: protectedProcedure
    .input(
      z.object({
        oldPassword: z.string().min(1),
        confirmPassword: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const results = await ctx.db
          .selectFrom("User")
          .select("hashed_password")
          .where("User.id", "=", ctx.user.id)
          .executeTakeFirst();
        const validatePassword = await new Argon2id().verify(
          results?.hashed_password ?? "",
          input.oldPassword,
        );

        if (validatePassword) {
          const hash = await new Argon2id().hash(input.confirmPassword);
          await ctx.db
            .updateTable("User")
            .set({
              hashed_password: hash,
            })
            .where("id", "=", ctx.user.id)
            .execute();
          return true;
        } else {
          return false;
        }
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  updateParticulars: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        mobile: z
          .string()
          .regex(/^\d{8}$/)
          .optional()
          .or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .updateTable("User")
          .set({
            email: input.email,
            mobile: input.mobile?.trim() === "" ? null : input.mobile,
          })
          .returning(["email", "mobile"])
          .where("id", "=", ctx.user.id)
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  getParticulars: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db
        .selectFrom("User")
        .leftJoin("StaffType", "User.staffTypeId", "StaffType.id")
        .leftJoin(
          "OrganizationUnit",
          "User.organizationUnitId",
          "OrganizationUnit.id",
        )
        .leftJoin("Course", "User.courseId", "Course.id")
        .select([
          "User.id",
          "User.name",
          "User.email",
          "User.mobile",
          "Course.name as course",
          "OrganizationUnit.name as organizationUnit",
          "StaffType.name as staffType",
        ])
        .where("User.id", "=", ctx.user.id)
        .executeTakeFirstOrThrow();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
