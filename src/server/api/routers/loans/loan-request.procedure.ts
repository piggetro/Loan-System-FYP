/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { db } from "@/database";
import { sql } from "kysely";
import { createId } from "@paralleldrive/cuid2";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";

export const loanRequestRouter = createTRPCRouter({
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    try {
      const [categories, subCategories] = await Promise.all([
        db.selectFrom("Category").selectAll().execute(),
        db.selectFrom("SubCategory").selectAll().execute(),
      ]);

      return { categories: categories, subCategories: subCategories };
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  getEquipmentAndInventory: protectedProcedure
    .input(z.object({ searchInput: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        //Checking if user is student
        const user = await db
          .selectFrom("User")
          .leftJoin("Role", "User.roleId", "Role.id")
          .select(["Role.role", "User.courseId"])
          .where("User.id", "=", ctx.user.id)
          .executeTakeFirstOrThrow();

        let referingCourseId = undefined;

        if (user.role === "Student") {
          if (user.courseId !== null) referingCourseId = user.courseId;
          else throw new Error("This Account is not linked to a Course");
        }
        const data = db
          .selectFrom("Equipment as e")
          .leftJoin(
            db
              .selectFrom("Inventory")
              .select("equipmentId")
              .select(sql`COUNT(*)`.as("count"))
              .groupBy("equipmentId")
              .as("i"),
            "e.id",
            "i.equipmentId",
          )
          .leftJoin("LoanItem as li", "e.id", "li.equipmentId")
          .leftJoin(
            "EquipmentOnCourses",
            "EquipmentOnCourses.equipmentId",
            "e.id",
          )
          .leftJoin("SubCategory", "e.subCategoryId", "SubCategory.id")
          .leftJoin("Category", "SubCategory.categoryId", "Category.id")
          .select([
            "e.id as equipmentId",
            "e.name as itemDescription",
            "Category.name as category",
            "SubCategory.name as subCategory",
            sql<number>`CAST(COALESCE(SUM(i.count), 0) - COALESCE(SUM(CASE WHEN li.status IS NOT NULL AND li.status NOT IN ('RETURNED', 'REQUEST_COLLECTION', 'CANCELLED') THEN 1 ELSE 0 END), 0) AS int)`.as(
              "quantityAvailable",
            ),
            sql<number>`1`.as("quantitySelected"),
          ])
          .where("e.name", "ilike", `%${input.searchInput}%`)
          .groupBy(["e.id", "SubCategory.id", "Category.name"])
          .having(
            sql`COALESCE(SUM(i.count), 0) - COALESCE(SUM(CASE WHEN li.status IS NOT NULL AND li.status NOT IN ('RETURNED', 'REQUEST_COLLECTION', 'CANCELLED') THEN 1 ELSE 0 END), 0)`,
            "!=",
            0,
          );
        let results;
        if (referingCourseId) {
          results = await data
            .where("EquipmentOnCourses.courseId", "=", referingCourseId)
            .execute();
        } else {
          results = await data.execute();
        }

        //To Prevent category and subcategory from being NULL
        return results.map((equipment) => ({
          ...equipment,
          category: equipment.category ?? "",
          subCategory: equipment.subCategory ?? "",
        }));
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getApprovingLecturers: protectedProcedure.query(async ({ ctx }) => {
    try {
      const approvingLecturers = await db
        .selectFrom("UserAccessRights")
        .leftJoin("User", "UserAccessRights.grantedUserId", "User.id")
        .leftJoin(
          "AccessRights",
          "UserAccessRights.accessRightId",
          "AccessRights.id",
        )
        .select(["User.email", "User.name"])
        .where("AccessRights.pageName", "=", "Approval Management")
        .where("User.id", "!=", ctx.user.id)
        .execute();

      return approvingLecturers.map((lecturer) => {
        return { email: lecturer.email ?? "", name: lecturer.name ?? "" };
      });
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
      const loanItems: { equipmentId: string; loanId: string; id: string }[] =
        [];

      const dueDateFormatted = input.dueDate;
      const approvingEmail = input.approvingLecturerEmail;
      const todayDate = new Date();

      try {
        const loanId = await ctx.db
          .selectFrom("Loan")
          .select(
            sql<string>`CONCAT(${db
              .selectFrom("Semesters")
              .select("Semesters.name")
              .where("Semesters.startDate", "<", todayDate)
              .where("Semesters.endDate", ">", todayDate)},'/', COUNT(*)+1)`.as(
              "loanId",
            ),
          )
          .where(
            "Loan.loanId",
            "like",
            db
              .selectFrom("Semesters")
              .select(sql<string>`CONCAT(name, '%')`.as("name"))
              .where("Semesters.startDate", "<", todayDate)
              .where("Semesters.endDate", ">", todayDate),
          )
          .executeTakeFirstOrThrow();
        await db.transaction().execute(async (trx) => {
          //Creating Loan
          const loanInsert = await ctx.db
            .insertInto("Loan")
            .values({
              id: createId(),
              loanId: loanId.loanId,
              remarks: input.remarks,
              dueDate: dueDateFormatted.toISOString(),
              status: "PENDING_APPROVAL",
              loanedById: ctx.user.id,
              approvingLecturerId: db
                .selectFrom("User")
                .select("User.id")
                .where("User.email", "=", input.approvingLecturerEmail),
            })
            .returning("Loan.id")
            .executeTakeFirstOrThrow();
          //Creating Array
          input.equipment.forEach((equipment) => {
            for (let i = 0; i < equipment.quantitySelected; i++) {
              loanItems.push({
                equipmentId: equipment.equipmentId,
                loanId: loanInsert.id,
                id: createId(),
              });
            }
          });
          //Inserting Loan Items
          await ctx.db.insertInto("LoanItem").values(loanItems).execute();
        });

        return "Success";
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getUserApprovalManagementLoanRequests: protectedProcedure.query(
    async ({ ctx }) => {
      try {
        const userApprovalManagementLoanRequests = await ctx.db
          .selectFrom("Loan")
          .selectAll("Loan")
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
                .whereRef("Loan.approvingLecturerId", "=", "User.id"),
            ).as("approvingLecturer"),
            jsonArrayFrom(
              eb
                .selectFrom("Equipment")
                .leftJoin("LoanItem", "LoanItem.loanId", "Loan.id")
                .where("Equipment.name", "!=", null)
                .select((eb1) => [
                  jsonObjectFrom(
                    eb1
                      .selectFrom("Equipment")
                      .select("Equipment.name")
                      .whereRef("Equipment.id", "=", "LoanItem.equipmentId"),
                  ).as("equipment"),
                ]),
            ).as("loanItems"),
          ])
          .where("Loan.approvingLecturerId", "=", ctx.user.id)
          .where("Loan.status", "=", "PENDING_APPROVAL")
          .execute();
        console.log(1);
        console.log(userApprovalManagementLoanRequests[0]?.loanItems);
        console.log(2);
        // loan.findMany({
        //   where: {
        //     approvingLecturerId: ctx.user.id,
        //     status: "PENDING_APPROVAL",
        //   },
        //   include: {
        //     loanedBy: {
        //       select: {
        //         name: true,
        //       },
        //     },
        //     approvingLecturer: { select: { name: true } },
        //     loanItems: {
        //       select: {
        //         equipment: {
        //           select: {
        //             name: true,
        //           },
        //         },
        //       },
        //     },
        //   },
        // });

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
        const userApprovalManagementLoanRequests = await ctx.db
          .selectFrom("Loan")
          .selectAll("Loan")
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
                .whereRef("Loan.approvingLecturerId", "=", "User.id"),
            ).as("approvingLecturer"),
            jsonArrayFrom(
              eb
                .selectFrom("Equipment")
                .leftJoin("LoanItem", "LoanItem.loanId", "Loan.id")
                .where("Equipment.name", "!=", null)
                .select((eb1) => [
                  jsonObjectFrom(
                    eb1
                      .selectFrom("Equipment")
                      .select("Equipment.name")
                      .whereRef("Equipment.id", "=", "LoanItem.equipmentId"),
                  ).as("equipment"),
                ]),
            ).as("loanItems"),
          ])
          .where("Loan.approvingLecturerId", "=", ctx.user.id)
          .where("Loan.status", "!=", "PENDING_APPROVAL")
          .execute();

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
        await ctx.db.transaction().execute(async (trx) => {
          await trx
            .updateTable("Loan")
            .set({ status: "REQUEST_COLLECTION", approvedById: ctx.user.id })
            .where("Loan.loanId", "=", input.loanId)
            .where("Loan.approvingLecturerId", "=", ctx.user.id)
            .execute();

          await trx
            .updateTable("LoanItem")
            .set({ status: "REQUEST_COLLECTION" })
            .where(
              "LoanItem.loanId",
              "=",
              ctx.db
                .selectFrom("Loan")
                .select("Loan.id")
                .where("Loan.loanId", "=", input.loanId),
            )
            .execute();
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
        await ctx.db.transaction().execute(async (trx) => {
          const data = await trx
            .updateTable("Loan")
            .set({ status: "REQUEST_COLLECTION", approvedById: ctx.user.id })
            .where("Loan.id", "=", input.id)
            .where("Loan.approvingLecturerId", "=", ctx.user.id)
            .returning("Loan.loanId")
            .executeTakeFirstOrThrow();

          await trx
            .updateTable("LoanItem")
            .set({ status: "REQUEST_COLLECTION" })
            .where("LoanItem.id", "=", input.id)
            .execute();
          return data.loanId;
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  rejectLoanRequest: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.transaction().execute(async (trx) => {
          await trx
            .updateTable("Loan")
            .set({ status: "REJECTED", approvedById: ctx.user.id })
            .where("Loan.id", "=", input.id)
            .where("Loan.approvingLecturerId", "=", ctx.user.id)
            .execute();

          await trx
            .updateTable("LoanItem")
            .set({ status: "CANCELLED" })
            .where(
              "LoanItem.loanId",
              "=",
              ctx.db
                .selectFrom("Loan")
                .select("Loan.id")
                .where("Loan.id", "=", input.id),
            )
            .execute();
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
        return await ctx.db.transaction().execute(async (trx) => {
          //Getting The Loan Items Requested For That Loan
          const loanItemsRequested = await trx
            .selectFrom("LoanItem")
            .groupBy("LoanItem.equipmentId")
            .select((eb) => [
              "LoanItem.equipmentId",
              eb.fn.count<number>("LoanItem.equipmentId").as("count"),
            ])
            .where("loanId", "=", input.id)
            .execute();

          const arrayOfEquipmentIdReq: string[] = [];
          loanItemsRequested.forEach((loanitem) => {
            arrayOfEquipmentIdReq.push(loanitem.equipmentId!);
          });

          //Getting count of requested items that exist in inventory
          const inventoryAvailability = await trx
            .selectFrom("Inventory")
            .select((eb) => [
              "Inventory.equipmentId",
              eb.fn.count<number>("Inventory.equipmentId").as("count"),
            ])
            .groupBy("Inventory.equipmentId")
            .where("equipmentId", "in", arrayOfEquipmentIdReq)
            .execute();

          //Getting Count of Current Total Unavailable Equipment grouped by equipmentID
          const loanItemsUnavailable = await trx
            .selectFrom("LoanItem")
            .select((eb) => [
              "LoanItem.equipmentId",
              eb.fn.count<number>("LoanItem.equipmentId").as("count"),
            ])
            .where((eb) =>
              eb.and([
                eb("LoanItem.status", "!=", "CANCELLED"),
                eb("LoanItem.status", "!=", "REQUEST_COLLECTION"),
                eb("LoanItem.status", "!=", "RETURNED"),
              ]),
            )
            .groupBy("LoanItem.equipmentId")
            .where("LoanItem.equipmentId", "in", arrayOfEquipmentIdReq)
            .execute();

          let allowedToRequestForLoan = true;

          loanItemsRequested.forEach((item) => {
            const inventoryCount = inventoryAvailability.find(
              (inventory) => inventory.equipmentId === item.equipmentId,
            )!.count;
            const itemUnavailability = loanItemsUnavailable.find(
              (loanItem) => loanItem.equipmentId === item.equipmentId,
            );
            if (itemUnavailability !== undefined) {
              if (inventoryCount - itemUnavailability.count < item.count) {
                allowedToRequestForLoan = false;
              }
            }
          });

          if (allowedToRequestForLoan) {
            await trx
              .updateTable("Loan")
              .set({ status: "PREPARING" })
              .where("Loan.id", "=", input.id)
              .where("Loan.loanedById", "=", ctx.user.id)
              .execute();

            await trx
              .updateTable("LoanItem")
              .set({ status: "PREPARING" })
              .where("LoanItem.loanId", "=", input.id)
              .execute();

            return "PREPARING";
          }

          return "UNAVAILABLE";
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  cancelLoan: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return ctx.db.transaction().execute(async (trx) => {
          await trx
            .updateTable("Loan")
            .set({ status: "CANCELLED" })
            .where("Loan.id", "=", input.id)
            .where("loanedById", "=", ctx.user.id)
            .execute();
          await trx
            .updateTable("LoanItem")
            .set({ status: "CANCELLED" })
            .where("LoanItem.loanId", "=", input.id)
            .execute();

          return "CANCELLED";
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getLoansToPrepare: protectedProcedure.query(async ({ ctx }) => {
    try {
      const results = await ctx.db
        .selectFrom("Loan")
        .selectAll("Loan")
        .where("Loan.status", "=", "PREPARING")
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
          jsonArrayFrom(
            eb
              .selectFrom("Equipment")
              .leftJoin("LoanItem", "LoanItem.loanId", "Loan.id")
              .where("Equipment.name", "!=", null)
              .select((eb1) => [
                jsonObjectFrom(
                  eb1
                    .selectFrom("Equipment")
                    .select("Equipment.name")
                    .whereRef("Equipment.id", "=", "LoanItem.equipmentId"),
                ).as("equipment"),
              ]),
          ).as("loanItems"),
        ])
        .execute();

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
        const loanDetails = await ctx.db
          .selectFrom("Loan")
          .selectAll("Loan")
          .where("Loan.id", "=", input.id)
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
            jsonArrayFrom(
              eb
                .selectFrom("LoanItem")
                .leftJoin("Loan", "LoanItem.loanId", "Loan.id")
                .selectAll("LoanItem")
                .where("Loan.id", "=", input.id)
                .select((eb1) => [
                  jsonObjectFrom(
                    eb1
                      .selectFrom("Equipment")
                      .selectAll()
                      .whereRef("Equipment.id", "=", "LoanItem.equipmentId"),
                  ).as("equipment"),
                ])
                .orderBy("LoanItem.equipmentId"),
            ).as("loanItems") ?? "",
          ])
          .executeTakeFirstOrThrow();

        return loanDetails;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getLoansForCollection: protectedProcedure.query(async ({ ctx }) => {
    try {
      const results = await ctx.db
        .selectFrom("Loan")
        .selectAll("Loan")
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("User")
              .select("User.name")
              .whereRef("Loan.loanedById", "=", "User.id"),
          ).as("loanedBy"),
        ])
        .where("Loan.status", "=", "READY")
        .execute();

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
      return ctx.db.transaction().execute(async (trx) => {
        const inventoryAvailability = await trx
          .selectFrom("Inventory")
          .select(sql<number>`CAST(COUNT(*) AS int)`.as("count"))
          .where((eb) =>
            eb.or(
              assetsArray.map((element) => {
                return eb.and([
                  eb("Inventory.equipmentId", "=", element.equipmentId),
                  eb("Inventory.assetNumber", "=", element.assetNumber),
                ]);
              }),
            ),
          )
          .where("Inventory.status", "=", "AVAILABLE")
          .executeTakeFirstOrThrow();

        if (assetsArray.length !== inventoryAvailability.count) {
          return {
            title: "Error",
            description: "Asset Number is Incorrect or Asset is Unavailable",
            variant: "destructive",
          };
        }

        //Link AssetNumber to LoanItem
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        input.loanedItem.forEach(async (loanItem) => {
          const test = await trx
            .updateTable("LoanItem")
            .set((eb) => ({
              inventoryId: eb
                .selectFrom("Inventory")
                .select("Inventory.id")
                .where("Inventory.assetNumber", "=", loanItem.assetNumber),
              status: "READY",
            }))
            .where("LoanItem.id", "=", loanItem.loanItemId)
            .execute();
          console.log(test);
        });

        await Promise.all([
          await trx
            .updateTable("Inventory")
            .set({ status: "LOANED" })
            .where((eb) =>
              eb.or(
                assetsArray.map((element) => {
                  return eb.and([
                    eb("Inventory.equipmentId", "=", element.equipmentId),
                    eb("Inventory.assetNumber", "=", element.assetNumber),
                  ]);
                }),
              ),
            )
            .where("Inventory.status", "=", "AVAILABLE")
            .executeTakeFirstOrThrow(),
          await trx
            .updateTable("Loan")
            .set({
              status: "READY",
              collectionReferenceNumber: input.collectionRefNum,
              preparedById: ctx.user.id,
            })
            .where("Loan.id", "=", input.id)
            .execute(),
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
        const loanDetails = await ctx.db
          .selectFrom("Loan")
          .selectAll("Loan")
          .where("Loan.id", "=", input.id)
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
            jsonArrayFrom(
              eb
                .selectFrom("LoanItem")
                .leftJoin("Loan", "LoanItem.loanId", "Loan.id")
                .selectAll("LoanItem")
                .where("Loan.id", "=", input.id)
                .select((eb1) => [
                  jsonObjectFrom(
                    eb1
                      .selectFrom("Equipment")
                      .selectAll()
                      .whereRef("Equipment.id", "=", "LoanItem.equipmentId"),
                  ).as("equipment"),
                  jsonObjectFrom(
                    eb1
                      .selectFrom("Inventory")
                      .selectAll()
                      .whereRef("LoanItem.inventoryId", "=", "Inventory.id"),
                  ).as("loanedInventory"),
                ])
                .orderBy("LoanItem.equipmentId"),
            ).as("loanItems") ?? "",
          ])
          .executeTakeFirstOrThrow();

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
        return await ctx.db.transaction().execute(async (trx) => {
          await trx
            .updateTable("Loan")
            .set({
              signature: input.signatureData,
              dateCollected: new Date(),
              status: "COLLECTED",
              issuedById: ctx.user.id,
            })
            .execute();

          await trx
            .updateTable("LoanItem")
            .set({ status: "COLLECTED" })
            .where("LoanItem.loanId", "=", input.id)
            .execute();

          return {
            title: "Loan Successfully Collected",
            description: "Loan Status has been updated to Collected",
            variant: "default",
          };
        });
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
      const loansForReturn = await ctx.db
        .selectFrom("Loan")
        .selectAll("Loan")
        .where("Loan.status", "=", "COLLECTED")
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
          jsonArrayFrom(
            eb
              .selectFrom("LoanItem")
              .leftJoin("Loan", "LoanItem.loanId", "Loan.id")
              .selectAll("LoanItem")
              .where("Loan.status", "=", "COLLECTED")
              .select((eb1) => [
                jsonObjectFrom(
                  eb1
                    .selectFrom("Equipment")
                    .selectAll()
                    .whereRef("Equipment.id", "=", "LoanItem.equipmentId"),
                ).as("equipment"),
                jsonObjectFrom(
                  eb1
                    .selectFrom("Inventory")
                    .selectAll()
                    .whereRef("LoanItem.inventoryId", "=", "Inventory.id"),
                ).as("loanedInventory"),
              ])
              .orderBy("LoanItem.equipmentId"),
          ).as("loanItems") ?? "",
        ])
        .execute();

      return loansForReturn;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  processLoanReturn: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        loanItemsToReturn: z.array(
          z.object({
            equipmentId: z.string().min(1),
            loanItemId: z.string().min(1),
            description: z.string().min(1),
            checklist: z.string().optional(),
            assetNumber: z.string().min(1),
            returned: z.string().min(1),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        let partialReturn = false;

        input.loanItemsToReturn.forEach((loanItem) => {
          if (loanItem.returned !== "Returned") partialReturn = true;
        });
        if (partialReturn) {
          return await ctx.db.transaction().execute(async (trx) => {
            for (const loanItem of input.loanItemsToReturn) {
              let loanItemStatus: "RETURNED" | "BROKEN" | "LOST" = "RETURNED";
              let inventoryStatus: "AVAILABLE" | "BROKEN" | "LOST" =
                "AVAILABLE";
              switch (loanItem.returned) {
                case "Lost":
                  loanItemStatus = "LOST";
                  inventoryStatus = "LOST";
                  break;
                case "Broken":
                  loanItemStatus = "BROKEN";
                  inventoryStatus = "BROKEN";
                  break;
              }
              await trx
                .updateTable("Inventory")
                .set({ status: inventoryStatus })
                .where("Inventory.assetNumber", "=", loanItem.assetNumber)
                .execute();
              await trx
                .updateTable("LoanItem")
                .set({ status: loanItemStatus })
                .where("LoanItem.id", "=", loanItem.loanItemId)
                .execute();
              await trx
                .updateTable("Loan")
                .set({
                  dateReturned: new Date(),
                  status: "PARTIAL_RETURN",
                  returnedToId: ctx.user.id,
                })
                .where("Loan.id", "=", input.id)
                .execute();

              return {
                title: "Loan Partially Returned",
                description:
                  "Loan Status has been updated to Partially Returned",
                variant: "default",
              };
            }
          });
        } else {
          return await ctx.db.transaction().execute(async (trx) => {
            await trx
              .updateTable("Inventory")
              .set({ status: "AVAILABLE" })
              .where((eb) =>
                eb(
                  "Inventory.id",
                  "in",
                  eb
                    .selectFrom("LoanItem")
                    .select("LoanItem.inventoryId")
                    .where("LoanItem.loanId", "=", input.id),
                ),
              )
              .execute();
            await trx
              .updateTable("LoanItem")
              .set({ status: "RETURNED" })
              .where("LoanItem.loanId", "=", input.id)
              .execute();
            await trx
              .updateTable("Loan")
              .set({
                dateReturned: new Date(),
                status: "RETURNED",
                returnedToId: ctx.user.id,
              })
              .where("Loan.id", "=", input.id)
              .execute();

            return {
              title: "Loan Returned",
              description: "Loan Status has been updated to Returned",
              variant: "default",
            };
          });
        }
      } catch (error) {
        console.log(error);
        return {
          title: "Something Unexpected Happened",
          description: "Please contact Help Desk",
          variant: "destructive",
        };
      }
    }),
  getLostAndBrokenLoans: protectedProcedure.query(async ({ ctx }) => {
    try {
      const loanLostAndBroken = await ctx.db
        .selectFrom("Loan")
        .selectAll("Loan")
        .select((eb) => [
          jsonObjectFrom(
            eb
              .selectFrom("User")
              .select("User.name")
              .whereRef("Loan.loanedById", "=", "User.id"),
          ).as("loanedBy"),
        ])
        .where("Loan.status", "=", "PARTIAL_RETURN")
        .execute();

      return loanLostAndBroken;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
