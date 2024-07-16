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
        ])
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.transaction().execute(async (trx) => {
          await trx
            .updateTable("Waiver")
            .set({
              status: "PENDING",
              waiveRequest: input.waiveRequest,
              dateSubmitted: new Date(),
            })
            .where("Waiver.loanId", "=", input.id)
            .execute();
        });
        return true;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
