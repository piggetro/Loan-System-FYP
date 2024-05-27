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
        //Access Rights to check
        const accessRightsToCheck = ["Preparation", "Collection", "Return"];
        //This array to contain the strings of allowed access

        const accessRightsArray = [];
        //Queries to get access
        const [usersLoanAccess, userAllowedToApproveLoan, usersOwnLoan] =
          await Promise.all([
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
            await ctx.db.loan.findUnique({
              where: {
                loanedById: ctx.user.id,
                id: input.id,
              },
            }),
          ]);
        if (usersOwnLoan !== null) {
          accessRightsArray.push("usersOwnLoan");
        }
        if (userAllowedToApproveLoan !== null) {
          accessRightsArray.push("userAllowedToApproveLoan");
        }
        usersLoanAccess.forEach((accessRight) => {
          if (accessRightsToCheck.includes(accessRight.accessRight.pageName)) {
            accessRightsArray.push(accessRight.accessRight.pageName);
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
        const loanDetails = await ctx.db.loan.findUnique({
          where: { id: input.id },
          include: {
            loanedBy: { select: { name: true } },
            approvedBy: { select: { name: true } },
            preparedBy: { select: { name: true } },
            issuedBy: { select: { name: true } },
            returnedTo: { select: { name: true } },
            loanItems: { include: { equipment: true } },
          },
        });

        return loanDetails;
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
