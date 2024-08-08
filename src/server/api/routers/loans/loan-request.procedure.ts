/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { number, z } from "zod";
import { db } from "@/database";
import { sql } from "kysely";
import { createId } from "@paralleldrive/cuid2";
import { jsonArrayFrom, jsonObjectFrom } from "kysely/helpers/postgres";
import {
  loanApproved,
  loanPrepared,
  sendLoanRequestApprover,
} from "@/lib/email/emails";

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
    .input(
      z.object({
        searchInput: z.string(),
        categoryId: z.string().min(1),
        subCategoryId: z.string().min(1),
      }),
    )
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

        let equipmentsQuery = db
          .selectFrom("Equipment as e")
          .leftJoin(
            "EquipmentOnCourses",
            "EquipmentOnCourses.equipmentId",
            "e.id",
          )
          .leftJoin("SubCategory", "e.subCategoryId", "SubCategory.id")
          .leftJoin("Category", "Category.id", "SubCategory.categoryId")
          .selectAll("e")
          .select([
            "SubCategory.name as subCategoryName",
            "Category.name as categoryName",
          ])
          .where("e.active", "=", true)
          .where("e.name", "ilike", `%${input.searchInput}%`)
          .distinctOn("e.id");

        let inventoryAvailabilityQuery = db
          .selectFrom("Inventory")
          .leftJoin("Equipment", "Inventory.equipmentId", "Equipment.id")
          .leftJoin("SubCategory", "SubCategory.id", "Equipment.subCategoryId")
          .select("equipmentId")
          .select([
            sql<number>`COUNT(*)`.as("count"),
            sql<number>`AVG(cost)`.as("avgCost"),
          ])
          .groupBy("equipmentId")
          .where((eb) =>
            eb.and([
              eb("Equipment.name", "ilike", `%${input.searchInput}%`),
              eb("Equipment.active", "=", true),
              eb("Inventory.active", "=", true),
              eb("Inventory.status", "=", "AVAILABLE"),
            ]),
          );
        let loanItemsUnavailableQuery = db
          .selectFrom("LoanItem")
          .select([
            "LoanItem.equipmentId",
            sql<number>`COALESCE(COUNT(*), 0)`.as("count"),
          ])
          .leftJoin("Equipment as e", "LoanItem.equipmentId", "e.id")
          .leftJoin("SubCategory", "SubCategory.id", "e.subCategoryId")
          .where("e.name", "ilike", `%${input.searchInput}%`)
          .where((eb) =>
            eb.or([
              eb("LoanItem.status", "=", "REQUEST_COLLECTION"),
              eb("LoanItem.status", "=", "PREPARING"),
            ]),
          )
          .groupBy("LoanItem.equipmentId");

        if (referingCourseId !== undefined) {
          equipmentsQuery = equipmentsQuery.where(
            "EquipmentOnCourses.courseId",
            "=",
            referingCourseId,
          );
        }

        if (input.categoryId !== "All") {
          equipmentsQuery = equipmentsQuery.where(
            "Category.id",
            "=",
            input.categoryId,
          );
          inventoryAvailabilityQuery = inventoryAvailabilityQuery.where(
            "SubCategory.categoryId",
            "=",
            input.categoryId,
          );
          loanItemsUnavailableQuery = loanItemsUnavailableQuery.where(
            "SubCategory.categoryId",
            "=",
            input.categoryId,
          );
        }
        if (input.subCategoryId !== "All") {
          equipmentsQuery = equipmentsQuery.where(
            "SubCategory.id",
            "=",
            input.subCategoryId,
          );
          inventoryAvailabilityQuery = inventoryAvailabilityQuery.where(
            "SubCategory.id",
            "=",
            input.subCategoryId,
          );
          loanItemsUnavailableQuery = loanItemsUnavailableQuery.where(
            "SubCategory.id",
            "=",
            input.categoryId,
          );
        }
        const [equipments, inventoryAvailability, loanItemsUnavailable] =
          await Promise.all([
            equipmentsQuery.execute(),
            inventoryAvailabilityQuery.execute(),
            loanItemsUnavailableQuery.execute(),
          ]);
        // const loanLimitPrice = generalSettingsLimit?.loanLimitPrice ?? 0;
        const data = equipments.map((equipment) => {
          let loanLimit = 0;
          const theoraticalAvailableItems =
            inventoryAvailability.find(
              (inventory) => inventory.equipmentId === equipment.id,
            )?.count ?? 0;
          const unavailableCount =
            loanItemsUnavailable.find(
              (item) => item.equipmentId === equipment.id,
            )?.count ?? 0;
          const actualAvailableItems =
            theoraticalAvailableItems - unavailableCount;
          // const averageCost =
          //   inventoryAvailability.find(
          //     (item) => item.equipmentId === equipment.id,
          //   )?.avgCost ?? 0;

          //this causes the equipment loan limit to take higher precedence than the general settings
          if (equipment.loanLimit !== 0) {
            if (actualAvailableItems > equipment.loanLimit) {
              loanLimit = equipment.loanLimit;
            } else {
              loanLimit = actualAvailableItems;
            }
          }
          // else if (loanLimitPrice !== 0) {
          //   if (averageCost >= loanLimitPrice) {
          //     if (actualAvailableItems >= 1) loanLimit = 1;
          //     else loanLimit = 0;
          //   } else {
          //     loanLimit = actualAvailableItems;
          //   }
          // }
          else {
            loanLimit = actualAvailableItems;
          }
          return {
            equipmentId: equipment.id,
            itemDescription: equipment.name,
            category: equipment.categoryName ?? "",
            subCategory: equipment.subCategoryName ?? "",
            quantityAvailable: loanLimit,
            quantitySelected: 1,
            photoPath: equipment.photoPath ?? "default.jpg",
          };
        });
        return data;
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
        approverEmail: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const loanItems: { equipmentId: string; loanId: string; id: string }[] =
        [];

      const dueDateFormatted = input.dueDate;
      dueDateFormatted.setDate(dueDateFormatted.getDate() + 1);
      console.log(dueDateFormatted);
      dueDateFormatted.setUTCHours(23, 59, 59, 0);
      console.log(dueDateFormatted);
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
        const loanInsertId = await db.transaction().execute(async (trx) => {
          //Creating Loan
          const loanInsert = await trx
            .insertInto("Loan")
            .values({
              id: createId(),
              loanId: loanId.loanId,
              remarks: input.remarks,
              dateCreated: new Date(),
              dueDate: dueDateFormatted.toISOString(),
              status: "PENDING_APPROVAL",
              loanedById: ctx.user.id,
              approverId: db
                .selectFrom("User")
                .select("User.id")
                .where("User.email", "=", input.approverEmail),
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
          await trx.insertInto("LoanItem").values(loanItems).execute();
          return loanInsert.id;
        });
        await sendLoanRequestApprover(
          input.approverEmail,
          process.env.DOMAIN + `/equipment-loans/loans/${loanInsertId}`,
        );
        return "Success";
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getUserApprovalManagementLoanRequests: protectedProcedure.query(
    async ({ ctx }) => {
      try {
        //Check if user has access rights
        const doesUserHaveApprovalRights = await ctx.db
          .selectFrom("UserAccessRights")
          .leftJoin(
            "AccessRights",
            "UserAccessRights.accessRightId",
            "AccessRights.id",
          )
          .selectAll()
          .where("UserAccessRights.grantedUserId", "=", ctx.user.id)
          .where("AccessRights.pageName", "=", "Approval Management")
          .executeTakeFirst();
        if (doesUserHaveApprovalRights === undefined) {
          return null;
        }
        const userApprovalManagementLoanRequests = await ctx.db
          .selectFrom("Loan")
          .select((eb) => [
            jsonObjectFrom(
              eb
                .selectFrom("User")
                .select("User.name")
                .whereRef("Loan.loanedById", "=", "User.id"),
            ).as("loanedBy"),
            "Loan.loanId",
            "Loan.id",
            "Loan.status",
            "Loan.dateCreated",
            "Loan.dueDate",
          ])
          .where("Loan.approverId", "=", ctx.user.id)
          .where("Loan.status", "=", "PENDING_APPROVAL")
          .orderBy("Loan.dateCreated desc")
          .execute();

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
                .whereRef("Loan.approverId", "=", "User.id"),
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
          .where("Loan.approverId", "=", ctx.user.id)
          .where("Loan.status", "!=", "PENDING_APPROVAL")
          .orderBy("Loan.dateCreated desc")
          .execute();

        return userApprovalManagementLoanRequests;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    },
  ),
  approveLoanRequestWithLoanId: protectedProcedure
    .input(
      z.object({
        loanId: z.string().min(1),
        loanItems: z.array(
          z.object({
            equipmentId: z.string().min(1),
            description: z.string().min(1),
            checklist: z.string().optional(),
            quantityRequested: z.number().min(1),
            quantityApproved: z.string().min(1),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.transaction().execute(async (trx) => {
          await trx
            .updateTable("Loan")
            .set({ status: "REQUEST_COLLECTION", approvedById: ctx.user.id })
            .where("Loan.loanId", "=", input.loanId)
            .where("Loan.approverId", "=", ctx.user.id)
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
          for (const item of input.loanItems) {
            if (parseInt(item.quantityApproved) !== item.quantityRequested) {
              await trx
                .updateTable("LoanItem")
                .set({ status: "REJECTED" })
                .where(
                  "LoanItem.id",
                  "in",
                  trx
                    .selectFrom("LoanItem")
                    .select("LoanItem.id")
                    .where("LoanItem.equipmentId", "=", item.equipmentId)
                    .limit(
                      item.quantityRequested - parseInt(item.quantityApproved),
                    ),
                )
                .execute();
            }
          }
        });

        return "Approved";
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  approveLoanRequestWithId: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        loanItems: z.array(
          z.object({
            equipmentId: z.string().min(1),
            description: z.string().min(1),
            checklist: z.string().optional(),
            quantityRequested: z.number().min(1),
            quantityApproved: z.string().min(1),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const loan = await ctx.db.transaction().execute(async (trx) => {
          const loan = await trx
            .updateTable("Loan")
            .set({ status: "REQUEST_COLLECTION", approvedById: ctx.user.id })
            .where("Loan.id", "=", input.id)
            .where("Loan.approverId", "=", ctx.user.id)
            .returning(["Loan.id", "Loan.loanId", "Loan.loanedById"])
            .executeTakeFirstOrThrow();

          const borrower = await trx
            .selectFrom("User as Borrower")
            .select("Borrower.email")
            .where("Borrower.id", "=", loan.loanedById)
            .executeTakeFirstOrThrow();

          await trx
            .updateTable("LoanItem")
            .set({ status: "REQUEST_COLLECTION" })
            .where("LoanItem.loanId", "=", input.id)
            .execute();
          for (const item of input.loanItems) {
            if (parseInt(item.quantityApproved) !== item.quantityRequested) {
              await trx
                .updateTable("LoanItem")
                .set({ status: "REJECTED" })
                .where(
                  "LoanItem.id",
                  "in",
                  trx
                    .selectFrom("LoanItem")
                    .select("LoanItem.id")
                    .where("LoanItem.equipmentId", "=", item.equipmentId)
                    .where("LoanItem.loanId", "=", input.id)
                    .limit(
                      item.quantityRequested - parseInt(item.quantityApproved),
                    ),
                )
                .execute();
            }
          }
          return {
            ...loan,
            borrowerEmail: borrower.email,
          };
        });
        await loanApproved(
          loan.borrowerEmail,
          process.env.DOMAIN + `/equipment-loans/loans/${loan.id}`,
          loan.loanId,
        );
        return {
          title: "Loan Successfully Approved",
          description: "Loan status is now Request Collection",
          variant: "default",
        };
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
            .where("Loan.approverId", "=", ctx.user.id)
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
        //Check if time of request is valid
        const generalSettingsTiming = await ctx.db
          .selectFrom("GeneralSettings")
          .selectAll()
          .executeTakeFirst();
        const startTime = parseInt(
          `${generalSettingsTiming?.startRequestForCollection.replace(/:/g, "")}00`,
        );
        const endTime = parseInt(
          `${generalSettingsTiming?.endRequestForCollection.replace(/:/g, "")}00`,
        );
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, "0");
        const minutes = now.getMinutes().toString().padStart(2, "0");
        const seconds = now.getSeconds().toString().padStart(2, "0");
        const timeNow24hr = parseInt(`${hours}${minutes}${seconds}`);
        if (!(timeNow24hr > startTime && timeNow24hr < endTime)) {
          return "COLLECTION TIME ERROR";
        }

        //Check if today is a holiday
        const holidays = await ctx.db
          .selectFrom("Holiday")
          .select(["Holiday.startDate", "Holiday.endDate"])
          .where(
            "Holiday.startDate",
            "<=",
            new Date(
              new Date(
                new Date().setFullYear(new Date().getFullYear() + 1),
              ).setHours(0, 0, 0, 0),
            ),
          )
          .where(
            "Holiday.endDate",
            ">=",
            new Date(new Date().setHours(0, 0, 0, 0)),
          )
          .execute();
        const arrayOfDates: Date[] = [];

        holidays.forEach((holiday) => {
          if (holiday.endDate === holiday.startDate) {
            arrayOfDates.push(new Date(holiday.startDate));
          } else {
            const startDate = new Date(holiday.startDate);

            while (startDate <= new Date(holiday.endDate)) {
              arrayOfDates.push(new Date(startDate));
              startDate.setDate(startDate.getDate() + 1);
            }
          }
        });
        const isHoliday = arrayOfDates.find(
          (date) => date.toDateString() === new Date().toDateString(),
        );
        if (isHoliday !== undefined) {
          return "COLLECTION DATE ERROR";
        }

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
            .where("LoanItem.status", "=", "REQUEST_COLLECTION")
            .execute();

          const arrayOfEquipmentIdReq: string[] = [];
          loanItemsRequested.forEach((loanitem) => {
            arrayOfEquipmentIdReq.push(loanitem.equipmentId!);
          });

          //Checking if equipment is enabled
          const equipmentCheck = await trx
            .selectFrom("Equipment")
            .select("Equipment.id")
            .where("Equipment.active", "=", true)
            .where("Equipment.id", "in", arrayOfEquipmentIdReq)
            .execute();

          if (equipmentCheck.length !== arrayOfEquipmentIdReq.length) {
            return "UNAVAILABLE";
          }

          //Getting count of requested items that exist in inventory
          const inventoryAvailability = await trx
            .selectFrom("Inventory")
            .select((eb) => [
              "Inventory.equipmentId",
              eb.fn.count<number>("Inventory.equipmentId").as("count"),
            ])
            .groupBy("Inventory.equipmentId")
            .where((eb) =>
              eb.and([
                eb("equipmentId", "in", arrayOfEquipmentIdReq),
                eb("Inventory.active", "=", true),
                eb("Inventory.status", "=", "AVAILABLE"),
              ]),
            )
            .execute();

          for (const loanItem of loanItemsRequested) {
            const numberOfAvailableItems = inventoryAvailability.find(
              (inventory) => inventory.equipmentId === loanItem.equipmentId,
            )?.count;

            if (numberOfAvailableItems! < loanItem.count) {
              return "UNAVAILABLE";
            }
          }

          //Getting Count of Current Total Unavailable Equipment grouped by equipmentID
          const loanItemsUnavailable = await trx
            .selectFrom("LoanItem")
            .select((eb) => [
              "LoanItem.equipmentId",
              eb.fn.count<number>("LoanItem.equipmentId").as("count"),
            ])
            .where((eb) =>
              eb.or([
                eb("LoanItem.status", "=", "REQUEST_COLLECTION"),
                eb("LoanItem.status", "=", "PREPARING"),
              ]),
            )
            .groupBy("LoanItem.equipmentId")
            .where("LoanItem.equipmentId", "in", arrayOfEquipmentIdReq)
            .where("LoanItem.loanId", "!=", input.id)
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
              .where("LoanItem.status", "=", "REQUEST_COLLECTION")
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
        .orderBy("Loan.dateCreated desc")
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
                .where("LoanItem.status", "=", "PREPARING")
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
        .orderBy("Loan.dateCreated desc")
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
          await trx
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
        });

        const [, loan] = await Promise.all([
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
            .returning(["Loan.loanedById", "Loan.loanId", "Loan.id"])
            .executeTakeFirstOrThrow(),
        ]);

        const borrower = await trx
          .selectFrom("User as Borrower")
          .select("Borrower.email")
          .where("Borrower.id", "=", loan.loanedById)
          .executeTakeFirstOrThrow();

        await loanPrepared(
          borrower.email,
          process.env.DOMAIN + `/equipment-loans/loans/${loan.id}`,
          loan.loanId,
        );

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
                .where("LoanItem.status", "=", "READY")
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
  getReturnLoanById: protectedProcedure
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
                .where("LoanItem.status", "=", "COLLECTED")
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
            .where("Loan.id", "=", input.id)
            .execute();

          await trx
            .updateTable("LoanItem")
            .set({ status: "COLLECTED" })
            .where("LoanItem.loanId", "=", input.id)
            .where("LoanItem.status", "!=", "REJECTED")
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
          title: "An unexpected error occured. Please try again later",
          description: "",
          variant: "destructive",
        };
      }
    }),
  getLoansForReturn: protectedProcedure.query(async ({ ctx }) => {
    try {
      const loansForReturn = await ctx.db
        .selectFrom("Loan")
        .selectAll("Loan")
        .where((eb) =>
          eb.or([
            eb("Loan.status", "=", "COLLECTED"),
            eb("Loan.status", "=", "PARTIAL_RETURN"),
          ]),
        )
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
        .orderBy("Loan.dateCreated desc")
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
            remarks: z.string().optional(),
            disabled: z.boolean(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        let partialReturn = false;
        const outstandingItems: string[] = [];
        let outstandingItemsRemarks = "";

        return await ctx.db.transaction().execute(async (trx) => {
          for (const loanItem of input.loanItemsToReturn) {
            console.log(loanItem);
            if (loanItem.disabled) continue;
            let loanItemStatus:
              | "RETURNED"
              | "DAMAGED"
              | "LOST"
              | "COLLECTED"
              | "MISSING_CHECKLIST_ITEMS" = "RETURNED";
            let inventoryStatus:
              | "AVAILABLE"
              | "DAMAGED"
              | "LOST"
              | "LOANED"
              | "MISSING_CHECKLIST_ITEMS" = "AVAILABLE";

            switch (loanItem.returned) {
              case "LOST":
                loanItemStatus = "LOST";
                inventoryStatus = "LOST";
                outstandingItems.push(loanItem.loanItemId);
                outstandingItemsRemarks === ""
                  ? (outstandingItemsRemarks = `${loanItem.description} (Lost)`)
                  : (outstandingItemsRemarks += `, ${loanItem.description} (Lost)`);
                break;
              case "DAMAGED":
                loanItemStatus = "DAMAGED";
                inventoryStatus = "DAMAGED";
                outstandingItems.push(loanItem.loanItemId);
                outstandingItemsRemarks === ""
                  ? (outstandingItemsRemarks = `${loanItem.description} (Damaged)`)
                  : (outstandingItemsRemarks += `, ${loanItem.description} (Damaged)`);
                break;
              case "MISSING_CHECKLIST_ITEMS":
                loanItemStatus = "MISSING_CHECKLIST_ITEMS";
                inventoryStatus = "MISSING_CHECKLIST_ITEMS";
                outstandingItems.push(loanItem.loanItemId);

                await trx
                  .updateTable("Inventory")
                  .set({
                    remarks: `Penalty For Checklist: ${loanItem.remarks}`,
                  })
                  .where("Inventory.assetNumber", "=", loanItem.assetNumber)
                  .execute();
                outstandingItemsRemarks === ""
                  ? (outstandingItemsRemarks = `${loanItem.description} (Penalty For Checklist: ${loanItem.remarks})`)
                  : (outstandingItemsRemarks += `, ${loanItem.description} (Penalty For Checklist: ${loanItem.remarks})`);
                break;
              case "COLLECTED":
                partialReturn = true;
                loanItemStatus = "COLLECTED";
                inventoryStatus = "LOANED";
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
          }
          if (outstandingItems.length !== 0) {
            //Check for existing waiver
            const existingWaiver = await trx
              .selectFrom("Waiver")
              .select(["Waiver.id", "Waiver.remarks"])
              .where("Waiver.loanId", "=", input.id)
              .executeTakeFirst();

            if (existingWaiver !== undefined) {
              await trx
                .updateTable("LoanItem")
                .set({ waiverId: existingWaiver.id })
                .where("LoanItem.id", "in", outstandingItems)
                .execute();
              await trx
                .updateTable("Waiver")
                .set({
                  remarks:
                    existingWaiver.remarks + ", " + outstandingItemsRemarks,
                })
                .where("Waiver.id", "=", existingWaiver.id)
                .execute();
            } else {
              const waiverId = createId();
              await trx
                .insertInto("Waiver")
                .values({
                  id: waiverId,
                  status: "PENDING_REQUEST",
                  loanId: input.id,
                  remarks: outstandingItemsRemarks,
                  dateIssued: new Date(),
                })
                .execute();
              await trx
                .updateTable("LoanItem")
                .set({ waiverId: waiverId })
                .where("LoanItem.id", "in", outstandingItems)
                .execute();
            }
          }
          if (partialReturn) {
            await trx
              .updateTable("Loan")
              .set({
                dateReturned: new Date(),
                returnedToId: ctx.user.id,
                status: "PARTIAL_RETURN",
              })
              .where("Loan.id", "=", input.id)
              .execute();
          } else {
            await trx
              .updateTable("Loan")
              .set({
                dateReturned: new Date(),
                returnedToId: ctx.user.id,
                status: "RETURNED",
              })
              .where("Loan.id", "=", input.id)
              .execute();
          }

          return {
            title: "Loan Updated",
            description: `Loan Status has been updated to ${partialReturn ? "Partial Return" : "Returned"} ${outstandingItems.length !== 0 ? " With Penalty Issued for Outstanding Items" : ""}`,
            variant: "default",
          };
        });
      } catch (error) {
        console.log(error);
        return {
          title: "An unexpected error occured. Please try again later",
          description: "",
          variant: "destructive",
        };
      }
    }),
  getLostAndDamagedLoans: protectedProcedure.query(async ({ ctx }) => {
    try {
      const lostAndDamagedLoan = await ctx.db
        .selectFrom("Loan")
        .selectAll("Loan")
        .innerJoin("LoanItem", "Loan.id", "LoanItem.loanId")
        .select((eb) => [
          eb
            .selectFrom("User")
            .whereRef("User.id", "=", "Loan.loanedById")
            .select("User.name")
            .as("loanedByName"),
          jsonArrayFrom(
            eb
              .selectFrom("LoanItem")
              .leftJoin("Equipment", "Equipment.id", "LoanItem.equipmentId")
              .selectAll("LoanItem")
              .select("Equipment.name"),
          ).as("loanItems"),
        ])
        .where("LoanItem.status", "in", [
          "DAMAGED",
          "LOST",
          "MISSING_CHECKLIST_ITEMS",
        ])
        .distinctOn("Loan.id")
        .orderBy("Loan.id")
        .orderBy("Loan.dateCreated", "desc")
        .execute();
      const data = lostAndDamagedLoan.map((item) => {
        let remarks = "";
        let counter = 0;
        item.loanItems.forEach((loanitem) => {
          if (
            loanitem.status === "LOST" ||
            loanitem.status === "DAMAGED" ||
            loanitem.status === "MISSING_CHECKLIST_ITEMS"
          ) {
            if (counter < 2) {
              remarks += `${counter === 0 ? "" : "\n"}${loanitem.name} (${loanitem.status})`;
            }

            counter++;
          }
        });
        if (counter > 2) {
          remarks += ` + ${counter - 2} More Outstanding Items`;
        }

        return {
          id: item.id,
          loanId: item.loanId,
          status: item.status,
          remarks: remarks,
          name: item.loanedByName,
        };
      });

      return data;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getUserOutstandingLoans: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.db
      .selectFrom("User")
      .select((eb) => [
        jsonArrayFrom(
          eb
            .selectFrom("Loan")
            .select(["Loan.loanId", "Loan.id"])
            .whereRef("Loan.loanedById", "=", "User.id")
            .where("Loan.dueDate", "<", new Date())
            .where("Loan.status", "in", ["COLLECTED", "PARTIAL_RETURN"]),
        ).as("overdueLoans"),
        jsonArrayFrom(
          eb
            .selectFrom("Loan")
            .leftJoin("Waiver", "Waiver.loanId", "Loan.id")
            .select((eb) => [
              "Waiver.status",
              "Loan.status as loanStatus",
              "Loan.id",
              "Loan.loanId",
              jsonArrayFrom(
                eb
                  .selectFrom("LoanItem as li")
                  .leftJoin("Equipment", "li.equipmentId", "Equipment.id")
                  .whereRef("li.loanId", "=", "Loan.id")
                  .selectAll("li")
                  .select("Equipment.name"),
              ).as("outstandingItems"),
            ])
            .whereRef("Loan.loanedById", "=", "User.id")
            .innerJoin("LoanItem", "Loan.id", "LoanItem.loanId")
            .where("LoanItem.status", "in", [
              "DAMAGED",
              "LOST",
              "MISSING_CHECKLIST_ITEMS",
            ])
            .distinctOn("Loan.id"),
        ).as("outstandingLoans"),
      ])
      .where("User.id", "=", ctx.user.id)
      .executeTakeFirstOrThrow();

    if (data.outstandingLoans.length === 0 && data.overdueLoans.length === 0) {
      return undefined;
    }

    const updateedOutstandingData = data.outstandingLoans.map((item) => {
      let remarks = "";
      let counter = 0;
      item.outstandingItems.forEach((loanitem) => {
        if (
          loanitem.status === "LOST" ||
          loanitem.status === "DAMAGED" ||
          loanitem.status === "MISSING_CHECKLIST_ITEMS"
        ) {
          if (counter < 2) {
            remarks += `${counter === 0 ? "" : "\n"}${loanitem.name} (${toStartCase(loanitem.status)})`;
          }

          counter++;
        }
      });
      if (counter > 2) {
        remarks += ` + ${counter - 2} More Outstanding Items`;
      }

      return {
        id: item.id,
        loanId: item.loanId,
        status: toStartCase(item.loanStatus),
        waiverStatus: toStartCase(item.status ?? ""),
        remarks: remarks,
      };
    });
    return {
      overdueLoans: data.overdueLoans,
      outstandingLoans: updateedOutstandingData,
    };
  }),
  processOutstandingLoanItem: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string().min(1),
          loanId: z.string().min(1),
          status: z.string().min(1),
          equipmentId: z.string().min(1),
          inventoryId: z.string().min(1),
          waiverId: z.string().min(1).optional().nullable(),
          name: z.string().min(1),
          checklist: z.string().optional().nullable(),
          remarks: z.string().optional().nullable(),
          assetNumber: z.string().min(1).optional().nullable(),
          edited: z.boolean(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction().execute(async (trx) => {
        for (const item of input) {
          let loanItemStatus:
            | "RETURNED"
            | "DAMAGED"
            | "LOST"
            | "MISSING_CHECKLIST_ITEMS" = "RETURNED";
          let inventoryStatus:
            | "AVAILABLE"
            | "DAMAGED"
            | "LOST"
            | "MISSING_CHECKLIST_ITEMS"
            | "UNAVAILABLE" = "AVAILABLE";
          switch (item.status) {
            case "LOST":
              loanItemStatus = "LOST";
              inventoryStatus = "LOST";
              break;
            case "DAMAGED":
              loanItemStatus = "DAMAGED";
              inventoryStatus = "DAMAGED";
              break;
            case "MISSING_CHECKLIST_ITEMS":
              loanItemStatus = "MISSING_CHECKLIST_ITEMS";
              inventoryStatus = "MISSING_CHECKLIST_ITEMS";
              break;
            case "UNAVAILABLE":
              inventoryStatus = "UNAVAILABLE";
              break;
          }
          if (!item.edited) continue;
          await trx
            .updateTable("LoanItem")
            .set({ status: loanItemStatus })
            .where("LoanItem.id", "=", item.id)
            .execute();
          await trx
            .updateTable("Inventory")
            .set({
              status: inventoryStatus,
              remarks: item.remarks,
            })
            .where("Inventory.id", "=", item.inventoryId)
            .execute();
        }
      });
      return true;
    }),
  searchLoans: protectedProcedure
    .input(
      z.object({
        searchInput: z.string(),
        status: z.enum([
          "PENDING_APPROVAL",
          "REJECTED",
          "REQUEST_COLLECTION",
          "PREPARING",
          "READY",
          "COLLECTED",
          "CANCELLED",
          "RETURNED",
          "PARTIAL_RETURN",
          "All",
        ]),
        semester: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        let loansForReturnQuery = ctx.db
          .selectFrom("Loan")
          .leftJoin("User as b", "b.id", "Loan.loanedById")
          .select((eb) => [
            "Loan.id",
            "Loan.loanId",
            "dateCreated",
            "dueDate",
            "status",
            jsonObjectFrom(
              eb
                .selectFrom("User")
                .select("User.name")
                .whereRef("Loan.loanedById", "=", "User.id"),
            ).as("loanedBy"),
            jsonArrayFrom(
              eb
                .selectFrom("Waiver")
                .leftJoin("LoanItem", "LoanItem.waiverId", "Waiver.id")
                .leftJoin("Equipment", "LoanItem.equipmentId", "Equipment.id")
                .whereRef("Waiver.loanId", "=", "Loan.id")
                .select(["Equipment.name", "LoanItem.status"]),
            ).as("outstandingItems"),
          ])
          .where((eb) =>
            eb.or([
              eb("Loan.loanId", "ilike", `%${input.searchInput}%`),
              eb("b.name", "ilike", `%${input.searchInput}%`),
            ]),
          )
          .orderBy("Loan.dateCreated desc");

        if (input.status !== "All") {
          loansForReturnQuery = loansForReturnQuery.where(
            "Loan.status",
            "=",
            input.status,
          );
        }
        if (input.semester !== "All") {
          loansForReturnQuery = loansForReturnQuery.where(
            "Loan.loanId",
            "ilike",
            `${input.semester}%`,
          );
        }
        const loansForReturn = await loansForReturnQuery.execute();

        return loansForReturn.map((item) => {
          let remarks = "";
          let counter = 0;
          item.outstandingItems.forEach((loanitem) => {
            if (
              loanitem.status === "LOST" ||
              loanitem.status === "DAMAGED" ||
              loanitem.status === "MISSING_CHECKLIST_ITEMS"
            ) {
              if (counter < 2) {
                remarks += `${counter === 0 ? "" : "\n"}${loanitem.name} (${loanitem.status})`;
              }

              counter++;
            }
          });
          if (counter > 2) {
            remarks += ` + ${counter - 2} More Outstanding Items`;
          }

          return {
            id: item.id,
            loanId: item.loanId,
            dateCreated: item.dateCreated,
            dueDate: item.dueDate,
            status: item.status,
            loanedBy: item.loanedBy,
            remarks: remarks,
          };
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getLoanToApproveById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const getLoanToApprove = await ctx.db
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
                .leftJoin("Equipment", "Equipment.id", "LoanItem.equipmentId")
                .select([
                  "Equipment.name",
                  "Equipment.id",
                  "Equipment.checklist",
                  sql<number>`COUNT(*)`.as("quantityRequested"),
                ])
                .groupBy("Equipment.id")
                .whereRef("LoanItem.loanId", "=", "Loan.id"),
            ).as("loanItems"),
          ])
          .where("Loan.id", "=", input.id)
          .executeTakeFirstOrThrow();
        return getLoanToApprove;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  checkIfUsersOwnLoan: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const data = await ctx.db
          .selectFrom("Loan")
          .select("Loan.loanedById")
          .where("Loan.id", "=", input.id)
          .executeTakeFirstOrThrow();

        if (data.loanedById === ctx.user.id) {
          return true;
        }
        return false;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
