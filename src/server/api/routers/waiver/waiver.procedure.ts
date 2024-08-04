/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import { sql } from "kysely";
import { createId } from "@paralleldrive/cuid2";

export const waiverRouter = createTRPCRouter({
  verifyWaiverByLoanId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const findWaiver = await ctx.db
          .selectFrom("Waiver")
          .selectAll()
          .where("Waiver.loanId", "=", input.id)
          .executeTakeFirst();
        if (findWaiver === undefined) {
          return false;
        }
        return true;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getWaivers: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db
        .selectFrom("Waiver as wr")
        .selectAll("wr")
        .leftJoin("Loan", "Loan.id", "wr.loanId")
        .leftJoin("User", "Loan.loanedById", "User.id")
        .select((eb) => [
          "User.name as loanedBy",
          "Loan.loanId as loanId",
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
        .distinctOn("Loan.id")
        .execute();

      return data.map((waiver) => {
        let remarks = "";
        let counter = 0;
        waiver.outstandingItems.forEach((loanitem) => {
          if (
            loanitem.status === "LOST" ||
            loanitem.status === "DAMAGED" ||
            loanitem.status === "MISSING_CHECKLIST_ITEMS"
          ) {
            if (counter < 2) {
              remarks += `${counter === 0 ? "" : "\n"}${loanitem.name} (${toStartCase(loanitem.status)})`;
            }

            counter++;
          }
        });
        if (counter > 2) {
          remarks += ` + ${counter - 2} More Outstanding Items`;
        }
        return {
          loanId: waiver.loanId,
          loanedBy: waiver.loanedBy,
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
  getWaiverHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db
        .selectFrom("Waiver as wr")
        .selectAll("wr")
        .leftJoin("Loan", "Loan.id", "wr.loanId")
        .leftJoin("User", "Loan.loanedById", "User.id")
        .select((eb) => [
          "User.name as loanedBy",
          "Loan.loanId as loanId",
          "Loan.id as loan_id",
        ])
        .distinctOn("Loan.id")
        .groupBy(["wr.loanId", "wr.id", "User.name", "Loan.loanId", "loan_id"])
        .having((eb) =>
          eb(
            eb.fn.count("wr.loanId"),
            "=",
            eb.fn.sum(sql`CASE WHEN wr.status != 'PENDING' THEN 1 ELSE 0 END`),
          ),
        )
        .execute();

      return data;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  approveWaiver: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.transaction().execute(async (trx) => {
          await trx
            .updateTable("Waiver")
            .set({
              status: "APPROVED",
              dateUpdated: new Date(),
              updatedById: ctx.user.id,
            })
            .where("Waiver.loanId", "=", input.id)
            .executeTakeFirstOrThrow();
        });

        return true;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  rejectWaiver: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const data = await ctx.db
          .updateTable("Waiver")
          .set({
            status: "REJECTED",
            dateUpdated: new Date(),
            updatedById: ctx.user.id,
          })
          .where("Waiver.loanId", "=", input.id)
          .execute();

        return true;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  resolveWaiver: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const data = await ctx.db
          .updateTable("Waiver")
          .set({
            status: "RESOLVED",
            dateUpdated: new Date(),
            updatedById: ctx.user.id,
          })
          .where("Waiver.loanId", "=", input.id)
          .execute();

        return true;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getWaiverByLoanId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const data = await ctx.db
          .selectFrom("Waiver")
          .leftJoin("Loan", "Loan.id", "Waiver.loanId")
          .selectAll("Waiver")
          .select((eb) => [
            "Loan.remarks as loanRemarks",
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
                .leftJoin("Inventory", "Inventory.id", "LoanItem.inventoryId")
                .leftJoin("Equipment", "LoanItem.equipmentId", "Equipment.id")
                .whereRef("Waiver.id", "=", "LoanItem.waiverId")
                .selectAll("LoanItem")
                .select([
                  "Equipment.name",
                  "Equipment.checklist",
                  "Inventory.remarks",
                  "Inventory.cost",
                ]),
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
    }),
  proccessWaiverRequest: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        waiveRequest: z.string().min(1),
        photoType: z.union([z.string(), z.null()]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const waiver = await ctx.db.transaction().execute(async (trx) => {
          return await trx
            .updateTable("Waiver")
            .set({
              status: "PENDING",
              waiveRequest: input.waiveRequest,
              dateSubmitted: new Date(),
              imagePath: input.photoType
                ? createId() + input.photoType
                : "default.jpg",
            })
            .where("Waiver.loanId", "=", input.id)
            .returning("Waiver.imagePath")
            .executeTakeFirstOrThrow();
        });
        return {
          imagePath: waiver.imagePath ?? "default.jpg",
        };
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
