import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { date, z } from "zod";

export const equipmentRouter = createTRPCRouter({
  getAllEquipments: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db.equipment.findMany({
        select: {
          id: true,
          name: true,
          subCategory: {
            select: {
              name: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              inventory: true,
            },
          },
        },
      });
      return data.map(({ _count, subCategory, ...equipment }) => ({
        ...equipment,
        category: subCategory?.category.name ?? "",
        subCategory: subCategory?.name ?? "",
        inventoryCount: _count.inventory,
      }));
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  deleteEquipment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.equipment.delete({
          where: {
            id: input.id,
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.category.findMany({
        select: {
          id: true,
          name: true,
          subCategory: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  addEquipment: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        checkList: z.string().optional(),
        category: z.string().min(1),
        subCategory: z.string().min(1),
        course: z.array(z.string().min(1)),
        inventoryItems: z.array(
          z.object({
            assetNumber: z.string().min(1),
            cost: z.number().multipleOf(0.01),
            datePurchased: z.date(),
            warrantyExpiry: z.date(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { _count, subCategory, ...equipment } =
          await ctx.db.equipment.create({
            data: {
              name: input.name,
              checklist: input.checkList,
              subCategoryId: input.subCategory,
              course: {
                create: input.course.map((course) => ({
                  courseId: course,
                })),
              },
              inventory: {
                create: input.inventoryItems.map((item) => ({
                  assetNumber: item.assetNumber,
                  cost: item.cost,
                  status: "AVAILABLE",
                  datePurchased: item.datePurchased,
                  warrantyExpiry: item.warrantyExpiry,
                })),
              },
            },
            select: {
              id: true,
              name: true,
              subCategory: {
                select: {
                  name: true,
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  inventory: true,
                },
              },
            },
          });
        return {
          ...equipment,
          category: subCategory?.category.name ?? "",
          subCategory: subCategory?.name ?? "",
          inventoryCount: _count.inventory,
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getEquipment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const data = await ctx.db.equipment.findUnique({
          where: {
            id: input.id,
          },
          select: {
            id: true,
            name: true,
            checklist: true,
            course: {
              select: {
                courseId: true,
              },
            },
            subCategory: {
              select: {
                id: true,
                categoryId: true,
              },
            },
            inventory: {
              select: {
                id: true,
                assetNumber: true,
                cost: true,
                status: true,
                datePurchased: true,
                warrantyExpiry: true,
              },
            },
          },
        });
        return {
          equipment: {
            id: data?.id ?? "",
            name: data?.name ?? "",
            checkList: data?.checklist ?? "",
            courses: data?.course.map((course) => course.courseId) ?? [],
            subCategory: data?.subCategory?.id ?? "",
            category: data?.subCategory?.categoryId ?? "",
          },
          inventoryItems: data?.inventory.map((item) => ({
            ...item,
            cost: item.cost.toFixed(2),
          })),
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  updateEquipment: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        checkList: z.string().optional(),
        category: z.string().min(1),
        subCategory: z.string().min(1),
        course: z.array(z.string().min(1)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const data = await ctx.db.equipment.update({
          where: {
            id: input.id,
          },
          data: {
            name: input.name,
            checklist: input.checkList,
            subCategoryId: input.subCategory,
            course: {
              deleteMany: {},
              create: input.course.map((course) => ({
                courseId: course,
              })),
            },
          },
          select: {
            id: true,
            name: true,
            checklist: true,
            course: {
              select: {
                courseId: true,
              },
            },
            subCategory: {
              select: {
                id: true,
                categoryId: true,
              },
            },
          },
        });
        return {
          id: data.id,
          name: data.name,
          checkList: data.checklist ?? "",
          courses: data.course.map((course) => course.courseId),
          subCategory: data.subCategory?.id ?? "",
          category: data.subCategory?.categoryId ?? "",
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  addInventoryItem: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        inventoryItems: z.array(
          z.object({
            assetNumber: z.string().min(1),
            cost: z.number().multipleOf(0.01),
            datePurchased: z.date(),
            warrantyExpiry: z.date(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.inventory.createMany({
          data: input.inventoryItems.map((item) => ({
            equipmentId: input.id,
            assetNumber: item.assetNumber,
            cost: item.cost,
            status: "AVAILABLE",
            datePurchased: item.datePurchased,
            warrantyExpiry: item.warrantyExpiry,
          })),
        });
        const data = await ctx.db.inventory.findMany({
          where: {
            equipmentId: input.id,
          },
          select: {
            id: true,
            assetNumber: true,
            cost: true,
            status: true,
            datePurchased: true,
            warrantyExpiry: true,
          },
        });
        return data.map((item) => ({
          ...item,
          cost: item.cost.toFixed(2),
        }));
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  updateInventoryItem: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        assetNumber: z.string().min(1),
        status: z.string().min(1),
        cost: z.number().multipleOf(0.01),
        datePurchased: z.date(),
        warrantyExpiry: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const data = await ctx.db.inventory.update({
          where: {
            id: input.id,
          },
          data: {
            assetNumber: input.assetNumber,
            cost: input.cost,
            status: input.status as "AVAILABLE" | "LOST" | "LOANED" | "BROKEN",
            datePurchased: input.datePurchased,
            warrantyExpiry: input.warrantyExpiry,
          },
          select: {
            id: true,
            assetNumber: true,
            cost: true,
            status: true,
            datePurchased: true,
            warrantyExpiry: true,
          },
        });
        return {
          ...data,
          cost: data.cost.toFixed(2),
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteEquipmentInventoryItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.inventory.delete({
          where: {
            id: input.id,
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
