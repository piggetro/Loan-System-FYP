import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { db } from "@/database";
import { sql } from "kysely";

export const userRouter = createTRPCRouter({
  getAllAccessRights: protectedProcedure.query(async ({ ctx }) => {
    try {
      const testdata = await db
        .selectFrom("User")
        .innerJoin(
          "UserAccessRights",
          "User.id",
          "UserAccessRights.grantedUserId",
        )
        .innerJoin(
          "AccessRights",
          "UserAccessRights.accessRightId",
          "AccessRights.id",
        )
        .where("User.id", "=", ctx.user.id)
        .select("AccessRights.pageLink")
        .execute();

      return testdata.map((accessRight) => accessRight.pageLink);
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getUserCurrentLoans: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db
        .selectFrom("Loan")
        .leftJoin("User", "Loan.approverId", "User.id")
        .select([
          "Loan.id",
          "Loan.loanId",
          "Loan.dueDate",
          "Loan.status",
          "User.name",
        ])
        .where("Loan.loanedById", "=", ctx.user.id)
        .where("Loan.status", "not in", ["REJECTED", "CANCELLED", "RETURNED"])
        .where("Loan.dueDate", ">", new Date())
        .orderBy("Loan.dateCreated desc")
        .execute();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getUserOverdueLoans: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db
        .selectFrom("Loan")
        .select([
          "id",
          "loanId",
          "dueDate",
          "status",
          sql<string>`DATE_PART('day', CURRENT_TIMESTAMP - "dueDate")`.as(
            "numberOfDaysDue",
          ),
        ])
        .where("loanedById", "=", ctx.user.id)
        .where("Loan.status", "in", ["COLLECTED", "PARTIAL_RETURN"])
        .where("Loan.dueDate", "<", new Date())
        .execute();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
