import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";

export const loanRequestRouter = createTRPCRouter({
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    try {
      const categories = await ctx.db.category.findMany();
      const subCategories = await ctx.db.subCategory.findMany();
      return { categories: categories, subCategories: subCategories };
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getEquipment: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const equipment = await ctx.db.equipment.findMany({
        include: {
          inventory: { where: { status: "AVAILABLE" } },
          subCategory: { include: { category: true } },
        },
      });

      return equipment;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getApprovingLecturers: protectedProcedure.query(async ({ ctx }) => {
    try {
      const approvingLecturers = await ctx.db.userAccessRights.findMany({
        select: {
          grantedUser: {
            select: {
              email: true,
              name: true,
            },
          },
        },

        where: {
          accessRight: { pageName: "Approval Management" },
          grantedUserId: { not: ctx.user.id },
        },
      });

      return approvingLecturers;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  createLoanRequest: protectedProcedure
    .input(
      z.object({
        remarks: z.string().min(1),
        dueDate: z.string().date(),
        equipment: z.array(
          z.object({
            equipmentId: z.string().min(1),
            itemDescription: z.string().min(1),
            category: z.string().min(1),
            subCategory: z.string().min(1),
            quantityAvailable: z.number(),
            quantitySelected: z.number(),
          }),
        ),
        approvingLecturerEmail: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const loanItems: { equipmentId: string }[] = [];
      //
      const loanId = "AY24/25-4222";

      input.equipment.forEach((equipment) => {
        for (let i = 0; i < equipment.quantitySelected; i++) {
          loanItems.push({
            equipmentId: equipment.equipmentId,
          });
        }
      });

      const dueDateFormatted = new Date(input.dueDate);
      const approvingEmail = input.approvingLecturerEmail;
      const todayDate = new Date();

      try {
        //Get Lecturer ID
        const approvingLecturerId = await ctx.db.user.findUnique({
          select: {
            id: true,
          },
          where: { email: approvingEmail },
        });
        if (approvingLecturerId == null) {
          return { title: "Error" };
        }
        //Get Semester
        const semester = await ctx.db.semesters.findFirst({
          select: { name: true },
          where: {
            startDate: {
              lt: todayDate,
            },
            endDate: {
              gt: todayDate,
            },
          },
        });
        //Handle Error
        if (semester == null) {
          console.log("semester is Invalid");
          throw Error();
        }
        const loanIdCount = await ctx.db.loan.count({
          where: {
            loanId: {
              startsWith: semester?.name,
            },
          },
        });

        const loanId = semester.name + "/" + (loanIdCount + 1);

        // Create Loan Request
        const equipment = await ctx.db.loan.create({
          data: {
            loanId: loanId,
            remarks: input.remarks,
            dueDate: dueDateFormatted.toISOString(),
            status: "PENDING_APPROVAL",
            loanedById: ctx.user.id,
            approvingLecturerId: approvingLecturerId.id,
            loanItems: { create: loanItems },
          },
        });

        return equipment;
      } catch (err) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getUserApprovalManagementLoanRequests: protectedProcedure.query(
    async ({ ctx }) => {
      try {
        const userApprovalManagementLoanRequests = await ctx.db.loan.findMany({
          where: {
            approvingLecturerId: ctx.user.id,
            status: "PENDING_APPROVAL",
          },
          include: {
            loanedBy: {
              select: {
                name: true,
              },
            },
            approvingLecturer: { select: { name: true } },
            loanItems: {
              select: {
                equipment: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

        return userApprovalManagementLoanRequests;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    },
  ),
  getUserApprovalManagementLoanHistory: protectedProcedure.query(
    async ({ ctx }) => {
      try {
        const userApprovalManagementLoanRequests = await ctx.db.loan.findMany({
          where: {
            approvingLecturerId: ctx.user.id,
            status: { not: "PENDING_APPROVAL" },
          },
          include: {
            loanedBy: {
              select: {
                name: true,
              },
            },
            approvingLecturer: { select: { name: true } },
            loanItems: {
              select: {
                equipment: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

        return userApprovalManagementLoanRequests;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    },
  ),
  approveLoanRequestWithLoanId: protectedProcedure
    .input(z.object({ loanId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.loan.update({
          data: {
            status: "APPROVED",
            approvedById: ctx.user.id,
          },
          where: {
            loanId: input.loanId,
            approvingLecturerId: ctx.user.id,
          },
        });

        return "Approved";
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  approveLoanRequestWithId: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const data = await ctx.db.loan.update({
          data: {
            status: "APPROVED",
            approvedById: ctx.user.id,
          },
          where: {
            id: input.id,
            approvingLecturerId: ctx.user.id,
          },
        });

        return data.loanId;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  rejectLoanRequest: protectedProcedure
    .input(z.object({ loanId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.loan.update({
          data: {
            status: "REJECTED",
          },
          where: {
            loanId: input.loanId,
            approvingLecturerId: ctx.user.id,
          },
        });

        return "Rejected";
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
