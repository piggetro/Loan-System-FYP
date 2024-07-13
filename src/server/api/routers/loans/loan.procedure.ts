/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { type LoanDetailsData } from "@/app/(protected)/equipment-loans/loans/[id]/_components/LoanDetailsTable";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

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
                .where("Loan.approverId", "=", ctx.user.id)
                .where("Loan.status", "=", "PENDING_APPROVAL")
                .where("Loan.id", "=", input.id)
                .as("userAllowedToApproveLoan"),
              ctx.db
                .selectFrom("Loan")
                .select("Loan.id")
                .where("Loan.loanedById", "=", ctx.user.id)
                .where("Loan.id", "=", input.id)
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
          .leftJoin("User as al", "al.id", "Loan.approverId")

          .selectAll("Loan")
          .select([
            "lb.name as loanedByName",
            "ab.name as approvedByName",
            "pb.name as preparedByName",
            "ib.name as issuedByName",
            "rt.name as returnedToName",
            "al.name as approverName",
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
        .leftJoin("User as lec", "lec.id", "Loan.approverId")
        .selectAll("Loan")
        .select("lec.name as approverName")
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
              .whereRef("approverId", "=", "User.id"),
          ).as("approver"),
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
  getUserLostAndDamagedLoans: protectedProcedure.query(async ({ ctx }) => {
    try {
      const lostAndDamagedLoan = await ctx.db
        .selectFrom("Loan")
        .selectAll("Loan")
        .innerJoin("LoanItem", "Loan.id", "LoanItem.loanId")
        .select((eb) => [
          jsonArrayFrom(
            eb
              .selectFrom("Waiver")
              .whereRef("Waiver.loanId", "=", "Loan.id")
              .selectAll(),
          ).as("outstandingItems"),
          eb
            .selectFrom("User")
            .whereRef("User.id", "=", "Loan.loanedById")
            .select("User.name")
            .as("loanedByName"),
        ])
        .where("LoanItem.status", "in", [
          "DAMAGED",
          "LOST",
          "MISSING_CHECKLIST_ITEMS",
        ])
        .where("Loan.loanedById", "=", ctx.user.id)
        .distinctOn("Loan.id")
        .execute();

      const data = lostAndDamagedLoan.map((item) => {
        let remarks = "";
        const statusArray: string[] = [];

        item.outstandingItems.forEach((outstandingItem) => {
          if (
            outstandingItem.status === "AWAITING_REQUEST" ||
            outstandingItem.status === "REJECTED"
          ) {
            remarks += outstandingItem.remarks;
          }
          statusArray.push(outstandingItem.status!);
        });
        let status;

        if (statusArray.every((status) => status === "APPROVED")) {
          status = "Approved";
        } else if (statusArray.every((status) => status === "PENDING")) {
          status = "Pending";
        } else if (
          statusArray.every((status) => status === "AWAITING_REQUEST")
        ) {
          status = "Awaiting Request";
        } else {
          status = "Partially Outstanding";
        }

        return {
          id: item.id,
          loanId: item.loanId,
          status: status,
          remarks: remarks,
        };
      });

      return data;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  verifyLostBrokenLoanByLoanId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const lostAndBrokenHistory = await ctx.db
          .selectFrom("Loan")
          .selectAll("Loan")
          .innerJoin("LoanItem", "Loan.id", "LoanItem.loanId")
          .where("LoanItem.status", "in", [
            "DAMAGED",
            "LOST",
            "MISSING_CHECKLIST_ITEMS",
          ])
          .where("Loan.id", "=", input.id)
          .distinctOn("Loan.id")
          .executeTakeFirstOrThrow();

        return lostAndBrokenHistory;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getLostBrokenLoanByLoanId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        try {
          const data = await ctx.db
            .selectFrom("Waiver")
            .leftJoin("Loan", "Loan.id", "Waiver.loanId")
            .selectAll("Waiver")
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
                  .whereRef("Loan.approvedById", "=", "User.id"),
              ).as("approvedBy"),
              jsonObjectFrom(
                eb
                  .selectFrom("User")
                  .select("User.name")
                  .whereRef("Loan.preparedById", "=", "User.id"),
              ).as("preparedBy"),
              jsonObjectFrom(
                eb
                  .selectFrom("User")
                  .select("User.name")
                  .whereRef("Loan.issuedById", "=", "User.id"),
              ).as("issuedBy"),
              jsonObjectFrom(
                eb
                  .selectFrom("User")
                  .select("User.name")
                  .whereRef("Loan.returnedToId", "=", "User.id"),
              ).as("returnedTo"),
              "Loan.loanId as loanId",
              // jsonArrayFrom(
              //   eb
              //     .selectFrom("Waiver")
              //     .leftJoin("LoanItem", "LoanItem.id", "Waiver.loanItemId")
              //     .leftJoin("Equipment", "Equipment.id", "LoanItem.equipmentId")
              //     .selectAll("Waiver")
              //     .select([
              //       "Equipment.name as equipment_name",
              //       "Equipment.checklist as equipment_checklist",
              //     ])
              //     .where("Waiver.loanId", "=", input.id),
              // ).as("loanItems") ?? "",
            ])
            .where("Waiver.loanId", "=", input.id)
            .executeTakeFirstOrThrow();

          return data;
        } catch (err) {
          console.log(err);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getOverdueLoans: protectedProcedure.query(async ({ ctx }) => {
    try {
      const overdueLoans = await ctx.db
        .selectFrom("Loan")
        .selectAll("Loan")
        .select((eb) => [
          eb
            .selectFrom("User")
            .whereRef("User.id", "=", "Loan.issuedById")
            .select("User.name")
            .as("issuedByname"),
        ])
        .where("Loan.dueDate", "<", new Date())
        .where("Loan.loanedById", "=", ctx.user.id)
        .where("Loan.status", "in", ["COLLECTED", "PARTIAL_RETURN"])
        .execute();

      return overdueLoans;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
