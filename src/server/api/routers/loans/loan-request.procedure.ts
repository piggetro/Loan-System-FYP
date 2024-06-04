import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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
        dueDate: z.date(),
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

      input.equipment.forEach((equipment) => {
        for (let i = 0; i < equipment.quantitySelected; i++) {
          loanItems.push({
            equipmentId: equipment.equipmentId,
          });
        }
      });

      const dueDateFormatted = input.dueDate;
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
            status: "REQUEST_COLLECTION",
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
            status: "REQUEST_COLLECTION",
            approvedById: ctx.user.id,
          },
          where: {
            id: input.id,
            approvingLecturerId: ctx.user.id,
          },
        });

        await ctx.db.loanItem.updateMany({
          data: {
            status: "REQUEST_COLLECTION",
          },
          where: {
            loanId: input.id,
          },
        });

        return data.loanId;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  rejectLoanRequest: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.loan.update({
          data: {
            status: "REJECTED",
          },
          where: {
            id: input.id,
            approvingLecturerId: ctx.user.id,
          },
        });

        await ctx.db.loanItem.updateMany({
          data: {
            status: "CANCELLED",
          },
          where: {
            loanId: input.id,
          },
        });

        return "Rejected";
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  requestForCollection: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const results = await ctx.db.loan.update({
          data: {
            status: "PREPARING",
          },
          where: {
            id: input.id,
            loanedById: ctx.user.id,
          },
        });

        await ctx.db.loanItem.updateMany({
          data: {
            status: "PREPARING",
          },
          where: {
            loanId: input.id,
          },
        });

        console.log(results);

        return "PREPARING";
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  cancelLoan: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.loan.update({
          data: {
            status: "CANCELLED",
          },
          where: {
            id: input.id,
            loanedById: ctx.user.id,
          },
        });
        await ctx.db.loanItem.updateMany({
          data: {
            status: "CANCELLED",
          },
          where: {
            loanId: input.id,
          },
        });

        return "CANCELLED";
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getLoansToPrepare: protectedProcedure.query(async ({ ctx }) => {
    try {
      const results = await ctx.db.loan.findMany({
        where: {
          status: "PREPARING",
        },
        include: {
          loanedBy: { select: { name: true } },
          approvedBy: { select: { name: true } },
          preparedBy: { select: { name: true } },
          issuedBy: { select: { name: true } },
          returnedTo: { select: { name: true } },
          loanItems: { include: { equipment: true, loanedInventory: true } },
        },
      });

      return results;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getPrepareLoanById: protectedProcedure
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
  getLoansForCollection: protectedProcedure.query(async ({ ctx }) => {
    try {
      const results = await ctx.db.loan.findMany({
        where: {
          status: "READY",
        },
        include: {
          loanedBy: {
            select: { name: true },
          },
        },
      });

      return results;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  prepareLoanRequest: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).max(50),
        collectionRefNum: z.string().min(1).max(50),
        loanedItem: z.array(
          z.object({
            loanItemId: z.string().min(1),
            equipmentId: z.string().min(1).default(""),
            description: z.string().min(1),
            checklist: z.string().optional(),
            assetNumber: z.string().min(1),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const assetsArray: { assetNumber: string; equipmentId: string }[] = [];

      input.loanedItem.forEach((item) => {
        assetsArray.push({
          equipmentId: item.equipmentId,
          assetNumber: item.assetNumber,
        });
      });
      return prisma.$transaction(async (tx) => {
        const inventoryAvailability = await ctx.db.inventory.findMany({
          where: {
            status: "AVAILABLE",
            OR: assetsArray,
          },
        });
        if (assetsArray.length !== inventoryAvailability.length) {
          return {
            title: "Error",
            description: "Asset Number is Incorrect or Asset is Unavailable",
            variant: "destructive",
          };
        }
        //Link AssetNumber to LoanItem
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        input.loanedItem.forEach(async (loanItem) => {
          const inventory = await ctx.db.inventory.findUnique({
            where: {
              assetNumber: loanItem.assetNumber,
            },
          });
          await ctx.db.loanItem.update({
            data: {
              inventoryId: inventory?.id,
              status: "READY",
            },
            where: {
              id: loanItem.loanItemId,
            },
          });
        });
        await ctx.db.inventory.updateMany({
          data: {
            status: "LOANED",
          },
          where: {
            status: "AVAILABLE",
            OR: assetsArray,
          },
        });

        await Promise.all([
          await ctx.db.inventory.updateMany({
            data: {
              status: "LOANED",
            },
            where: {
              status: "AVAILABLE",
              OR: assetsArray,
            },
          }),
          await ctx.db.loan.update({
            data: {
              status: "READY",
            },
            where: {
              id: input.id,
            },
          }),
          await ctx.db.loan.update({
            data: {
              collectionReferenceNumber: input.collectionRefNum,
              preparedById: ctx.user.id,
            },
            where: {
              id: input.id,
            },
          }),
        ]);

        return {
          title: "Successful",
          description: "Loan is now ready for collection",
          variant: "default",
        };
      });
    }),
  getReadyLoanById: protectedProcedure
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
            loanItems: { include: { equipment: true, loanedInventory: true } },
          },
        });

        return loanDetails;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  processLoanCollection: protectedProcedure
    .input(
      z.object({ signatureData: z.string().min(1), id: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.loan.update({
          where: { id: input.id },
          data: {
            signature: input.signatureData,
            dateCollected: new Date(),
            status: "COLLECTED",
            issuedById: ctx.user.id,
          },
        });

        await ctx.db.loanItem.updateMany({
          data: {
            status: "COLLECTED",
          },
          where: {
            loanId: input.id,
          },
        });

        return {
          title: "Loan Successfully Collected",
          description: "Loan Status has been updated to Collected",
          variant: "default",
        };
      } catch (error) {
        console.log(error);
        return {
          title: "Something Unexpected Happened",
          description: "Please contact Help Desk",
          variant: "destructive",
        };
      }
    }),
  getLoansForReturn: protectedProcedure.query(async ({ ctx }) => {
    try {
      const loanDetails = await ctx.db.loan.findMany({
        where: { status: "COLLECTED" },
        include: {
          loanedBy: { select: { name: true } },
          approvedBy: { select: { name: true } },
          preparedBy: { select: { name: true } },
          issuedBy: { select: { name: true } },
          returnedTo: { select: { name: true } },
          loanItems: { include: { equipment: true, loanedInventory: true } },
        },
      });

      return loanDetails;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  processLoanReturn: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.inventory.updateMany({
          where: {
            loanItems: {
              some: {
                loanId: input.id,
              },
            },
          },
          data: { status: "AVAILABLE" },
        });
        await ctx.db.loan.update({
          where: { id: input.id },
          data: {
            dateReturned: new Date(),
            status: "RETURNED",
            returnedToId: ctx.user.id,
          },
        });

        return {
          title: "Loan Returned Collected",
          description: "Loan Status has been updated to Returned",
          variant: "default",
        };
      } catch (error) {
        console.log(error);
        return {
          title: "Something Unexpected Happened",
          description: "Please contact Help Desk",
          variant: "destructive",
        };
      }
    }),
});
