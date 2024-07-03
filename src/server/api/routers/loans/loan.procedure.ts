/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { type LoanDetailsData } from "@/app/(protected)/equipment-loans/loans/[id]/_components/LoanDetailsTable";
import { jsonObjectFrom } from "kysely/helpers/postgres";

export const loanRouter = createTRPCRouter({
  verifyLoanById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const findLoan = await ctx.db
          .selectFrom("Loan")
          .selectAll()
          .where("Loan.id", "=", input.id)
          .executeTakeFirst();
        if (findLoan === undefined) {
          return false;
        }
        return true;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getUsersLoanAccess: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        //Access Rights to check
        const accessRightsToCheck = ["Preparation", "Collection", "Return"];
        //This array to contain the strings of allowed access
        const accessRightsArray = [];
        //Queries to get access
        const [usersAccessRights, userLoanPermission] = await Promise.all([
          await ctx.db
            .selectFrom("UserAccessRights")
            .leftJoin(
              "AccessRights",
              "AccessRights.id",
              "UserAccessRights.accessRightId",
            )
            .select("AccessRights.pageName")
            .where("UserAccessRights.grantedUserId", "=", ctx.user.id)
            .execute(),
          await ctx.db
            .selectFrom("Loan")
            .select([
              ctx.db
                .selectFrom("Loan")
                .select("Loan.id")
                .where("Loan.approvingLecturerId", "=", ctx.user.id)
                .where("Loan.status", "=", "PENDING_APPROVAL")
                .as("userAllowedToApproveLoan"),
              ctx.db
                .selectFrom("Loan")
                .select("Loan.id")
                .where("Loan.loanedById", "=", ctx.user.id)
                .as("usersOwnLoan"),
            ])
            .where("Loan.id", "=", input.id)
            .executeTakeFirst(),
        ]);

        if (userLoanPermission?.usersOwnLoan !== null) {
          accessRightsArray.push("usersOwnLoan");
        }
        if (userLoanPermission?.userAllowedToApproveLoan !== null) {
          accessRightsArray.push("userAllowedToApproveLoan");
        }
        usersAccessRights.forEach((accessRight) => {
          if (accessRightsToCheck.includes(accessRight.pageName!)) {
            accessRightsArray.push(accessRight.pageName);
          }
        });
        console.log(accessRightsArray);

        return accessRightsArray;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getLoanById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const loanDetails = await ctx.db
          .selectFrom("Loan")
          .leftJoin("User as lb", "lb.id", "Loan.loanedById")
          .leftJoin("User as ab", "ab.id", "Loan.approvedById")
          .leftJoin("User as pb", "pb.id", "Loan.preparedById")
          .leftJoin("User as ib", "ib.id", "Loan.issuedById")
          .leftJoin("User as rt", "rt.id", "Loan.returnedToId")

          .selectAll("Loan")
          .select([
            "lb.name as loanedByName",
            "ab.name as approvedByName",
            "pb.name as preparedByName",
            "ib.name as issuedByName",
            "rt.name as returnedToName",
          ])
          .where("Loan.id", "=", input.id)
          .executeTakeFirstOrThrow();

        const equipmentInLoan = await ctx.db
          .selectFrom("Loan")
          .leftJoin("LoanItem", "LoanItem.loanId", "Loan.id")
          .leftJoin("Equipment", "LoanItem.equipmentId", "Equipment.id")
          .selectAll("Equipment")
          .select("LoanItem.status")
          .where("Loan.id", "=", input.id)
          .execute();

        const results: LoanDetailsData = {
          ...loanDetails,
          loanItems: equipmentInLoan.map((equipment) => ({
            ...equipment,
            id: equipment.id ?? "",
            name: equipment.name ?? "",
          })),
        };

        return results;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getUsersLoans: protectedProcedure.query(async ({ ctx }) => {
    try {
      const usersLoanDetails = await ctx.db
        .selectFrom("Loan")
        .leftJoin("User as lec", "lec.id", "Loan.approvingLecturerId")
        .selectAll("Loan")
        .select("lec.name as approvingLecturerName")
        .where("loanedById", "=", ctx.user.id)
        .execute();

      return usersLoanDetails;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getSemesters: protectedProcedure.query(async ({ ctx }) => {
    try {
      const allSemesters = await ctx.db
        .selectFrom("Semesters")
        .select("name")
        .where("Semesters.startDate", "<", new Date())
        .execute();

      return allSemesters;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getUserLoanHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const loanHistory = await ctx.db
        .selectFrom("Loan")
        .selectAll("Loan")
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("User")
              .select("User.name")
              .whereRef("Loan.loanedById", "=", "User.id"),
          ).as("loanedBy"),
          jsonObjectFrom(
            eb
              .selectFrom("User")
              .select("User.name")
              .whereRef("approvingLecturerId", "=", "User.id"),
          ).as("approvingLecturer"),
        ])
        .where((eb) =>
          eb.and([
            eb("Loan.loanedById", "=", ctx.user.id),
            eb.or([
              eb("Loan.status", "=", "REJECTED"),
              eb("Loan.status", "=", "CANCELLED"),
              eb("Loan.status", "=", "RETURNED"),
            ]),
          ]),
        )
        .execute();

      return loanHistory;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
