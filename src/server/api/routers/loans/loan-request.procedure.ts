import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { equal } from "assert";

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
      const loanId = "AY24/25-422";

      input.equipment.forEach((equipment) => {
        for (let i = 0; i < equipment.quantitySelected; i++) {
          loanItems.push({
            equipmentId: equipment.equipmentId,
          });
        }
      });

      const dueDateFormatted = new Date(input.dueDate);
      const approvingEmail = input.approvingLecturerEmail;

      try {
        const approvingLecturerId = await ctx.db.user.findUnique({
          select: {
            id: true,
          },
          where: { email: approvingEmail },
        });
        if (approvingLecturerId == null) {
          return { title: "Error" };
        }
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
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
