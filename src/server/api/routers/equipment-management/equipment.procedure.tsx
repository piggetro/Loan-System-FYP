import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { createId } from "@paralleldrive/cuid2";

export const equipmentRouter = createTRPCRouter({
  getAllEquipments: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db
        .selectFrom("Equipment")
        .leftJoin("SubCategory", "Equipment.subCategoryId", "SubCategory.id")
        .leftJoin("Category", "SubCategory.categoryId", "Category.id")
        .leftJoin("Inventory", "Equipment.id", "Inventory.equipmentId")
        .groupBy(["Equipment.id", "SubCategory.name", "Category.name"])
        .select([
          "Equipment.id",
          "Equipment.name",
          "SubCategory.name as subCategory",
          "Category.name as category",
          ctx.db.fn
            .count("Inventory.id")
            .filterWhere("Inventory.active", "=", true)
            .as("totalCount"),
          ctx.db.fn
            .count("Inventory.id")
            .filterWhere("Inventory.active", "=", true)
            .filterWhere("Inventory.status", "=", "AVAILABLE")
            .as("availableCount"),
          ctx.db.fn
            .count("Inventory.id")
            .filterWhere("Inventory.active", "=", true)
            .filterWhere("Inventory.status", "!=", "AVAILABLE")
            .as("unavailableCount"),
        ])
        .where("Equipment.active", "=", true)
        .execute();
      return data.map((equipment) => ({
        ...equipment,
        subCategory: equipment.subCategory ?? "",
        category: equipment.category ?? "",
        totalCount: parseInt(equipment.totalCount?.toString() ?? ""),
        availableCount: parseInt(equipment.availableCount?.toString() ?? ""),
        unavailableCount: parseInt(
          equipment.unavailableCount?.toString() ?? "",
        ),
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
        await ctx.db
          .updateTable("Equipment")
          .set({ active: false })
          .where("id", "=", input.id)
          .execute();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db
        .selectFrom("Category")
        .select((eb) => [
          "id",
          "name",
          jsonArrayFrom(
            eb
              .selectFrom("SubCategory")
              .select(["SubCategory.id", "SubCategory.name"])
              .whereRef("SubCategory.categoryId", "=", eb.ref("Category.id")),
          ).as("subCategory"),
        ])
        .execute();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .selectFrom("Category")
          .select((eb) => [
            "id",
            "name",
            jsonArrayFrom(
              eb
                .selectFrom("SubCategory")
                .select(["SubCategory.id", "SubCategory.name"])
                .whereRef("SubCategory.categoryId", "=", eb.ref("Category.id")),
            ).as("subCategory"),
          ])
          .where("id", "=", input.id)
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  addSubCategory: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.array(z.string().min(1)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .insertInto("SubCategory")
          .values(
            input.name.map((name) => ({
              id: createId(),
              name: name,
              categoryId: input.id,
            })),
          )
          .returning(["id", "name"])
          .execute();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  updateSubCategory: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .updateTable("SubCategory")
          .set({
            name: input.name,
          })
          .where("id", "=", input.id)
          .returning(["id", "name"])
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteSubCategory: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .deleteFrom("SubCategory")
          .where("id", "=", input.id)
          .execute();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  addCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        subCategory: z.array(z.string().min(1)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.transaction().execute(async (trx) => {
          const category = await trx
            .insertInto("Category")
            .values({
              id: createId(),
              name: input.name,
            })
            .returningAll()
            .executeTakeFirstOrThrow();
          input.subCategory.length &&
            (await trx
              .insertInto("SubCategory")
              .values(
                input.subCategory.map((subCategory) => ({
                  id: createId(),
                  name: subCategory,
                  categoryId: category.id,
                })),
              )
              .execute());
          return category;
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .updateTable("Category")
          .set({
            name: input.name,
          })
          .where("id", "=", input.id)
          .returningAll()
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .deleteFrom("Category")
          .where("id", "=", input.id)
          .execute();
        return;
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
        const equipment = await ctx.db
          .with("newEquipment", (db) =>
            db
              .insertInto("Equipment")
              .values({
                id: createId(),
                name: input.name,
                checklist: input.checkList,
                subCategoryId: input.subCategory,
                updatedAt: new Date(),
                active: true,
              })
              .returning(["id", "name", "subCategoryId"]),
          )
          .with("equipmentDetails", (db) =>
            db
              .selectFrom("newEquipment")
              .leftJoin(
                "SubCategory",
                "newEquipment.subCategoryId",
                "SubCategory.id",
              )
              .leftJoin("Category", "SubCategory.categoryId", "Category.id")
              .select([
                "newEquipment.id",
                "newEquipment.name",
                "SubCategory.name as subCategory",
                "Category.name as category",
              ]),
          )
          .selectFrom("equipmentDetails")
          .selectAll()
          .executeTakeFirstOrThrow();

        input.inventoryItems.length &&
          (await ctx.db
            .insertInto("Inventory")
            .values(
              input.inventoryItems.map((item) => ({
                id: createId(),
                equipmentId: equipment.id,
                assetNumber: item.assetNumber,
                cost: item.cost.toFixed(2),
                status: "AVAILABLE",
                datePurchased: item.datePurchased,
                warrantyExpiry: item.warrantyExpiry,
                active: true,
              })),
            )
            .execute());

        input.course.length &&
          (await ctx.db
            .insertInto("EquipmentOnCourses")
            .values(
              input.course.map((course) => ({
                courseId: course,
                equipmentId: equipment.id,
              })),
            )
            .execute());
        return {
          ...equipment,
          subCategory: equipment.subCategory ?? "",
          category: equipment.category ?? "",
          totalCount: input.inventoryItems.length,
          availableCount: input.inventoryItems.length,
          unavailableCount: 0,
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
        const [equipment, courses, inventory] = await Promise.all([
          await ctx.db
            .selectFrom("Equipment")
            .leftJoin(
              "SubCategory",
              "Equipment.subCategoryId",
              "SubCategory.id",
            )
            .leftJoin("Category", "SubCategory.categoryId", "Category.id")
            .select([
              "Equipment.id",
              "Equipment.name",
              "Equipment.checklist",
              "SubCategory.id as subCategory",
              "Category.id as category",
            ])
            .where("Equipment.id", "=", input.id)
            .where("Equipment.active", "=", true)
            .executeTakeFirst(),
          await ctx.db
            .selectFrom("EquipmentOnCourses")
            .leftJoin(
              "Equipment",
              "EquipmentOnCourses.equipmentId",
              "Equipment.id",
            )
            .select("EquipmentOnCourses.courseId")
            .where("EquipmentOnCourses.equipmentId", "=", input.id)
            .where("Equipment.active", "=", true)
            .execute(),
          await ctx.db
            .selectFrom("Inventory")
            .select([
              "id",
              "assetNumber",
              "cost",
              "status",
              "datePurchased",
              "warrantyExpiry",
            ])
            .where("equipmentId", "=", input.id)
            .where("active", "=", true)
            .execute(),
        ]);
        return {
          equipment: {
            id: equipment?.id ?? "",
            name: equipment?.name ?? "",
            checkList: equipment?.checklist ?? "",
            subCategory: equipment?.subCategory ?? "",
            category: equipment?.category ?? "",
            courses: courses.map((course) => course.courseId),
          },
          inventoryItems: inventory.map((item) => ({
            ...item,
            cost: parseInt(item.cost).toFixed(2),
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
        courses: z.array(z.string().min(1)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const equipment = await ctx.db
          .updateTable("Equipment")
          .set({
            name: input.name,
            checklist: input.checkList,
            subCategoryId: input.subCategory,
            updatedAt: new Date(),
          })
          .where("id", "=", input.id)
          .returning(["id", "name", "checklist", "subCategoryId"])
          .executeTakeFirst();

        await ctx.db.transaction().execute(async (trx) => {
          await trx
            .deleteFrom("EquipmentOnCourses")
            .where("equipmentId", "=", input.id)
            .execute();
          input.courses.length &&
            (await trx
              .insertInto("EquipmentOnCourses")
              .values(
                input.courses.map((course) => ({
                  equipmentId: input.id,
                  courseId: course,
                })),
              )
              .execute());
          return;
        });

        return {
          id: equipment?.id ?? "",
          name: equipment?.name ?? "",
          checkList: equipment?.checklist ?? "",
          subCategory: equipment?.subCategoryId ?? "",
          category: input.category,
          courses: input.courses,
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
        const data = await ctx.db
          .insertInto("Inventory")
          .values(
            input.inventoryItems.map((item) => ({
              id: createId(),
              equipmentId: input.id,
              assetNumber: item.assetNumber,
              cost: item.cost.toFixed(2),
              status: "AVAILABLE",
              datePurchased: item.datePurchased,
              warrantyExpiry: item.warrantyExpiry,
              active: true,
            })),
          )
          .returning([
            "id",
            "assetNumber",
            "cost",
            "status",
            "datePurchased",
            "warrantyExpiry",
          ])
          .execute();
        return data.map((item) => ({
          ...item,
          cost: parseInt(item.cost).toFixed(2),
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
        const data = await ctx.db
          .updateTable("Inventory")
          .set({
            assetNumber: input.assetNumber,
            status: input.status as "AVAILABLE" | "LOST" | "LOANED" | "DAMAGED",
            cost: input.cost.toFixed(2),
            datePurchased: input.datePurchased,
            warrantyExpiry: input.warrantyExpiry,
          })
          .where("id", "=", input.id)
          .returning([
            "id",
            "assetNumber",
            "cost",
            "status",
            "datePurchased",
            "warrantyExpiry",
          ])
          .executeTakeFirst();
        return {
          id: data?.id ?? "",
          assetNumber: data?.assetNumber ?? "",
          status: data?.status ?? "",
          dataPurchased: data?.datePurchased ?? new Date(),
          warrantyExpiry: data?.warrantyExpiry ?? new Date(),
          cost: parseInt(data?.cost ?? "").toFixed(2),
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
        await ctx.db
          .updateTable("Inventory")
          .set({ active: false })
          .where("id", "=", input.id)
          .execute();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getGeneralSettings: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db
        .selectFrom("GeneralSettings")
        .selectAll()
        .executeTakeFirst();
      return {
        timeOfCollection: {
          start: data?.startTimeOfCollection ?? "",
          end: data?.endTimeOfCollection ?? "",
        },
        requestForCollection: {
          start: data?.startRequestForCollection ?? "",
          end: data?.endRequestForCollection ?? "",
        },
        voidLoan: {
          numberOfDays: data?.voidLoanNumberOfDays ?? 0,
          timing: data?.voidLoanTiming ?? "",
        },
      };
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  updateGeneralSettings: protectedProcedure
    .input(
      z.object({
        startTimeOfCollection: z.string().min(1),
        endTimeOfCollection: z.string().min(1),
        startRequestForCollection: z.string().min(1),
        endRequestForCollection: z.string().min(1),
        voidLoanNumberOfDays: z.number().min(1),
        voidLoanTiming: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .updateTable("GeneralSettings")
          .set({
            startTimeOfCollection: input.startTimeOfCollection,
            endTimeOfCollection: input.endTimeOfCollection,
            startRequestForCollection: input.startRequestForCollection,
            endRequestForCollection: input.endRequestForCollection,
            voidLoanNumberOfDays: input.voidLoanNumberOfDays,
            voidLoanTiming: input.voidLoanTiming,
          })
          .returningAll()
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
