import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";

export const loanRouter = createTRPCRouter({
  verifyLoanById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const findLoan = await ctx.db.loan.findUnique({
          where: { id: input.id },
        });
        if (findLoan === null) {
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
        //This array to contain the strings of allowed access
        const accessRightsArray = [];
        //Queries to get access
        const [usersLoanAccess, userAllowedToApproveLoan] = await Promise.all([
          await ctx.db.userAccessRights.findMany({
            where: { grantedUserId: ctx.session.userId },
            select: { accessRight: { select: { pageName: true } } },
          }),
          await ctx.db.loan.findUnique({
            where: {
              approvingLecturerId: ctx.user.id,
              id: input.id,
              status: "PENDING_APPROVAL",
            },
          }),
        ]);
        if (userAllowedToApproveLoan !== null) {
          accessRightsArray.push("userAllowedToApproveLoan");
        }

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
        const loanDetails = await ctx.db.loan.findUnique({
          where: { id: input.id },
          include: {
            loanedBy: { select: { name: true } },
            approvedBy: { select: { name: true } },
            preparedBy: { select: { name: true } },
            issuedBy: { select: { name: true } },
            returnedTo: { select: { name: true } },
            loanItems: { select: { equipment: true } },
          },
        });
        console.log(loanDetails?.loanItems);
        return loanDetails;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getAllLoans: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db.loan.findMany({
        select: {
          id: true,
          loanId: true,
          dateCreated: true,
          collectionDate: true,
          dueDate: true,
          approvingLecturer: {
            select: {
              name: true
            }
          },
          status: true,
        },
      });

      return data.map((loan) => ({
        id: loan.id,
        loanId: loan.loanId,
        dateRequested: loan.dateCreated,
        dateCollected: loan.collectionDate,
        dueDate: loan.dueDate,
        approvingLecturer: loan.approvingLecturer?.name,
        status: loan.status,
      }));
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getUsersLoans: protectedProcedure.query(async ({ ctx }) => {
    try {
      const usersLoanDetails = await ctx.db.loan.findMany({
        where: { loanedById: ctx.user.id },
        include: {
          // loanedBy: { select: { name: true } },
          approvingLecturer: { select: { name: true } },
          // preparedBy: { select: { name: true } },
          // issuedBy: { select: { name: true } },
          // returnedTo: { select: { name: true } },
          // loanItems: { select: { equipment: true } },
        },
      });

      return usersLoanDetails;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getSemesters: protectedProcedure.query(async ({ ctx }) => {
    try {
      const allSemesters = await ctx.db.semesters.findMany({
        select: { name: true },
      });

      return allSemesters;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
