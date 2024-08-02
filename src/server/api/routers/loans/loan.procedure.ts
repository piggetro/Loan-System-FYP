/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { type LoanDetailsData } from "@/app/(protected)/equipment-loans/loans/[id]/_components/LoanDetailsTable";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import { Timestamp } from "@/db/types";

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
        const [usersAccessRights, userLoanPermission, loanOutstandingItems] =
          await Promise.all([
            await ctx.db
              .selectFrom("UserAccessRights")
              .leftJoin(
                "AccessRights",
                "AccessRights.id",
                "UserAccessRights.accessRightId",
              )
              .select(["AccessRights.pageName", "AccessRights.pageLink"])
              .where("UserAccessRights.grantedUserId", "=", ctx.user.id)
              .execute(),
            await ctx.db
              .selectFrom("Loan")
              .select([
                ctx.db
                  .selectFrom("Loan")
                  .select("Loan.id")
                  .where("Loan.approverId", "=", ctx.user.id)
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
            ctx.db
              .selectFrom("Waiver")
              .select("id")
              .where("Waiver.loanId", "=", input.id)
              .execute(),
          ]);
        if (
          loanOutstandingItems.length !== 0 &&
          usersAccessRights.findIndex(
            (accessRight) =>
              accessRight.pageLink === "/loan-management/lost-damaged-loans",
          ) !== -1
        ) {
          accessRightsArray.push("Lost/Damaged Loans");
        }
        if (
          loanOutstandingItems.length !== 0 &&
          userLoanPermission?.usersOwnLoan !== null
        ) {
          accessRightsArray.push("Waiver Option");
        }
        if (userLoanPermission?.usersOwnLoan !== null) {
          accessRightsArray.push("usersOwnLoan");
        }
        if (
          loanOutstandingItems.length !== 0 &&
          usersAccessRights.findIndex(
            (accessRight) => accessRight.pageLink === "/loan-management/waiver",
          ) !== -1
        ) {
          accessRightsArray.push("Admin Waiver Option");
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

        const outstandingItems = await ctx.db
          .selectFrom("LoanItem")
          .leftJoin("Equipment", "LoanItem.equipmentId", "Equipment.id")
          .leftJoin("Inventory", "Inventory.id", "LoanItem.inventoryId")
          .selectAll("LoanItem")
          .select([
            "Equipment.name",
            "Equipment.checklist",
            "Inventory.assetNumber",
            "Inventory.remarks",
          ])
          .where("LoanItem.loanId", "=", input.id)
          .where("LoanItem.waiverId", "is not", null)
          .execute();

        const results: LoanDetailsData = {
          ...loanDetails,
          outstandingItems: outstandingItems,
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
          eb
            .selectFrom("User")
            .whereRef("User.id", "=", "Loan.loanedById")
            .select("User.name")
            .as("loanedByName"),
          jsonArrayFrom(
            eb
              .selectFrom("LoanItem")
              .leftJoin("Equipment", "Equipment.id", "LoanItem.equipmentId")
              .selectAll("LoanItem")
              .select("Equipment.name")
              .whereRef("LoanItem.loanId", "=", "Loan.id"),
          ).as("outstandingItems"),
        ])
        .where("LoanItem.status", "in", [
          "DAMAGED",
          "LOST",
          "MISSING_CHECKLIST_ITEMS",
        ])
        .where("Loan.loanedById", "=", ctx.user.id)
        .distinctOn("Loan.id")
        .execute();
      console.log(lostAndDamagedLoan[0]?.outstandingItems);
      const data = lostAndDamagedLoan.map((item) => {
        let remarks = "";
        const statusArray: string[] = [];

        item.outstandingItems.forEach((outstandingItem) => {
          if (
            outstandingItem.status === "DAMAGED" ||
            outstandingItem.status === "LOST" ||
            outstandingItem.status === "MISSING_CHECKLIST_ITEMS"
          ) {
            remarks +=
              outstandingItem.name +
              ` (${toStartCase(outstandingItem.status)})`;
          }
          statusArray.push(outstandingItem.status!);
        });
        let status;

        if (statusArray.every((status) => status === "APPROVED")) {
          status = "Approved";
        } else if (statusArray.every((status) => status === "PENDING")) {
          status = "Pending";
        } else if (
          statusArray.every((status) => status === "PENDING_REQUEST")
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
          .where("LoanItem.waiverId", "is not", null)
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
                  .whereRef("Waiver.updatedById", "=", "User.id"),
              ).as("updatedByName"),
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
              jsonArrayFrom(
                eb
                  .selectFrom("LoanItem")
                  .leftJoin("Equipment", "LoanItem.equipmentId", "Equipment.id")
                  .leftJoin("Inventory", "Inventory.id", "LoanItem.inventoryId")
                  .selectAll("LoanItem")
                  .select([
                    "Equipment.name",
                    "Equipment.checklist",
                    "Inventory.remarks",
                    "Inventory.cost",
                  ])
                  .where("LoanItem.loanId", "=", input.id)
                  .where("LoanItem.waiverId", "is not", null),
              ).as("loanItems") ?? "",
            ])
            .where("Waiver.loanId", "=", input.id)
            .executeTakeFirstOrThrow();
          console.log(data);
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
  getLoanTimings: protectedProcedure.query(async ({ ctx }) => {
    try {
      const loanTimings = await ctx.db
        .selectFrom("GeneralSettings")
        .select([
          "GeneralSettings.startTimeOfCollection",
          "GeneralSettings.endTimeOfCollection",
          "GeneralSettings.endRequestForCollection",
          "GeneralSettings.startRequestForCollection",
        ])
        .executeTakeFirst();

      return loanTimings;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getHolidays: protectedProcedure.query(async ({ ctx }) => {
    try {
      //get all holidays from today till next year
      const holidays = await ctx.db
        .selectFrom("Holiday")
        .select(["Holiday.startDate", "Holiday.endDate"])
        .where(
          "Holiday.startDate",
          "<=",
          new Date(
            new Date(
              new Date().setFullYear(new Date().getFullYear() + 1),
            ).setHours(0, 0, 0, 0),
          ),
        )
        .where(
          "Holiday.endDate",
          ">=",
          new Date(new Date().setHours(0, 0, 0, 0)),
        )
        .execute();
      const arrayOfDates: Date[] = [];

      holidays.forEach((holiday) => {
        if (holiday.endDate === holiday.startDate) {
          arrayOfDates.push(new Date(holiday.startDate));
        } else {
          const startDate = new Date(holiday.startDate);

          while (startDate <= new Date(holiday.endDate)) {
            arrayOfDates.push(new Date(startDate));
            startDate.setDate(startDate.getDate() + 1);
          }
        }
      });

      return arrayOfDates;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  getUsersWaivers: protectedProcedure.query(async ({ ctx }) => {
    try {
      //get all holidays from today till next year
      const waivers = await ctx.db
        .selectFrom("Waiver")
        .leftJoin("Loan", "Loan.id", "Waiver.loanId")
        .selectAll("Waiver")
        .select((eb) => [
          "Loan.loanId",
          "Loan.id as loan_id",
          jsonArrayFrom(
            eb
              .selectFrom("LoanItem as li")
              .leftJoin("Equipment", "li.equipmentId", "Equipment.id")
              .whereRef("li.loanId", "=", "Loan.id")
              .selectAll("li")
              .select("Equipment.name"),
          ).as("outstandingItems"),
        ])
        .where("Loan.loanedById", "=", ctx.user.id)
        .execute();

      return waivers.map((waiver) => {
        let remarks = "";
        waiver.outstandingItems.forEach((item) => {
          if (
            item.status === "DAMAGED" ||
            item.status === "LOST" ||
            item.status === "MISSING_CHECKLIST_ITEMS"
          ) {
            remarks += item.name + ` (${toStartCase(item.status)})<br>`;
          }
        });
        return {
          loanId: waiver.loanId,
          id: waiver.loan_id,
          dateIssued: waiver.dateIssued,
          dateUpdated: waiver.dateUpdated,
          status: waiver.status,
          remarks: remarks,
        };
      });
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
