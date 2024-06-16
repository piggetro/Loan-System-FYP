import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";

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
});
