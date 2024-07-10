/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import { sql } from "kysely";

export const waiverRouter = createTRPCRouter({
  verifyWaiverByLoanId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const findWaiver = await ctx.db
          .selectFrom("WaiveRequest")
          .selectAll()
          .where("WaiveRequest.loanId", "=", input.id)
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
  getPendingWaiver: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db
        .selectFrom("WaiveRequest as wr")
        .selectAll("wr")
        .leftJoin("Loan", "Loan.id", "wr.loanId")
        .leftJoin("User", "Loan.loanedById", "User.id")
        .select((eb) => [
          "User.name as loanedBy",
          "Loan.loanId as loanId",
          "Loan.id as loan_id",
        ])
        .where("wr.status", "=", "PENDING")
        .distinctOn("Loan.id")
        .execute();

      return data;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getWaiverHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db
        .selectFrom("WaiveRequest as wr")
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
          const updateWaiver = await trx
            .updateTable("WaiveRequest")
            .set({ status: "APPROVED" })
            .where("WaiveRequest.id", "=", input.id)
            .returning("WaiveRequest.loanItemId")
            .executeTakeFirstOrThrow();
          const updateLoanItem = await trx
            .updateTable("LoanItem")
            .set({ status: "RETURNED" })
            .where("LoanItem.id", "=", updateWaiver.loanItemId)
            .returning("LoanItem.inventoryId")
            .executeTakeFirstOrThrow();
          await trx
            .updateTable("Inventory")
            .set({ status: "AVAILABLE", remarks: null })
            .where("Inventory.id", "=", updateLoanItem.inventoryId)
            .execute();
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
          .updateTable("WaiveRequest")
          .set({ status: "REJECTED" })
          .where("WaiveRequest.id", "=", input.id)
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
          .selectFrom("WaiveRequest")
          .leftJoin("Loan", "Loan.id", "WaiveRequest.loanId")
          .selectAll("WaiveRequest")
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
            jsonArrayFrom(
              eb
                .selectFrom("WaiveRequest")
                .leftJoin("LoanItem", "LoanItem.id", "WaiveRequest.loanItemId")
                .leftJoin("Equipment", "Equipment.id", "LoanItem.equipmentId")
                .selectAll("WaiveRequest")
                .select([
                  "Equipment.name as equipment_name",
                  "Equipment.checklist as equipment_checklist",
                ])
                .where("WaiveRequest.loanId", "=", input.id),
            ).as("loanItems") ?? "",
          ])
          .where("WaiveRequest.loanId", "=", input.id)
          .executeTakeFirstOrThrow();

        return data;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  proccessWaiverRequest: protectedProcedure
    .input(
      z.object({
        outstandingItems: z.array(
          z.object({
            id: z.string().min(1),
            reason: z.string().min(5),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.transaction().execute(async (trx) => {
          for (const item of input.outstandingItems) {
            await trx
              .updateTable("WaiveRequest")
              .set({ reason: item.reason, status: "PENDING" })
              .where("WaiveRequest.id", "=", item.id)
              .execute();
          }
        });
        return true;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
