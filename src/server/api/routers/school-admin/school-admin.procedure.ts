import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { Argon2id } from "oslo/password";
import { createId } from "@paralleldrive/cuid2";
import { jsonArrayFrom } from "kysely/helpers/postgres";

export const schoolAdminRouter = createTRPCRouter({
  getAccessRights: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.selectFrom("AccessRights").selectAll().execute();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  updateAccessRight: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        pageName: z.string().min(1),
        pageLink: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .updateTable("AccessRights")
          .set({
            pageName: input.pageName,
            pageLink: input.pageLink,
          })
          .where("id", "=", input.id)
          .returning(["id", "pageName", "pageLink"])
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteAccessRight: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .deleteFrom("AccessRights")
          .where("id", "=", input.id)
          .executeTakeFirst();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  addAccessRight: protectedProcedure
    .input(
      z.object({ pageName: z.string().min(1), pageLink: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .insertInto("AccessRights")
          .values({
            id: createId(),
            pageName: input.pageName,
            pageLink: input.pageLink,
          })
          .returning([
            "AccessRights.id",
            "AccessRights.pageName",
            "AccessRights.pageLink",
          ])
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getAllRoles: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db
        .selectFrom("Role")
        .leftJoin(
          "AccessRightsOnRoles",
          "Role.id",
          "AccessRightsOnRoles.roleId",
        )
        .leftJoin("User", "Role.id", "User.roleId")
        .select([
          "Role.id",
          "Role.role",
          ctx.db.fn
            .count("AccessRightsOnRoles.accessRightId")
            .distinct()
            .as("accessRightsCount"),
          ctx.db.fn.count("User.id").distinct().as("usersCount"),
        ])
        .groupBy("Role.id")
        .execute();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  deleteRole: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .deleteFrom("Role")
          .where("id", "=", input.id)
          .executeTakeFirst();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  addRole: protectedProcedure
    .input(
      z.object({
        role: z.string().min(1),
        accessRights: z.array(z.string().min(1)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const role = await ctx.db
          .insertInto("Role")
          .values({
            id: createId(),
            role: input.role,
          })
          .returning(["Role.id", "Role.role"])
          .executeTakeFirstOrThrow();

        await ctx.db
          .insertInto("AccessRightsOnRoles")
          .values(
            input.accessRights.map((accessRightId) => ({
              roleId: role.id,
              accessRightId: accessRightId,
            })),
          )
          .execute();
        return {
          id: role.id,
          role: role.role,
          accessRightsCount: input.accessRights.length,
          usersCount: 0,
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getAllStaff: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db
        .selectFrom("User")
        .leftJoin(
          "OrganizationUnit",
          "User.organizationUnitId",
          "OrganizationUnit.id",
        )
        .leftJoin("StaffType", "User.staffTypeId", "StaffType.id")
        .leftJoin("Role", "User.roleId", "Role.id")
        .select([
          "User.id",
          "User.email",
          "User.name",
          "OrganizationUnit.name as organizationUnit",
          "StaffType.name as staffType",
          "Role.role as role",
        ])
        .where("User.organizationUnitId", "is not", null)
        .where("User.staffTypeId", "is not", null)
        .execute();
      return data.map((staff) => ({
        ...staff,
        organizationUnit: staff.organizationUnit ?? "",
        staffType: staff.staffType ?? "",
        role: staff.role ?? "",
      }));
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  deleteStaff: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .deleteFrom("User")
          .where("id", "=", input.id)
          .executeTakeFirst();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getAllOrganizationUnits: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.selectFrom("OrganizationUnit").selectAll().execute();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getAllStaffTypes: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.selectFrom("StaffType").selectAll().execute();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  addStaff: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        email: z.string().email(),
        name: z.string().min(1),
        organizationUnit: z.string().min(1),
        staffType: z.string().min(1),
        role: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const accessRights = await ctx.db
          .selectFrom("AccessRightsOnRoles")
          .select(["accessRightId"])
          .where("roleId", "=", input.role)
          .execute();

        const accessRightsToBeAdded = accessRights.map((accessRight) => ({
          id: createId(),
          accessRightId: accessRight.accessRightId,
          grantedUserId: input.id,
          grantedById: ctx.user.id,
        }));

        const [result] = await ctx.db
          .with("newStaff", (db) =>
            db
              .insertInto("User")
              .values({
                id: input.id,
                email: input.email,
                name: input.name,
                organizationUnitId: input.organizationUnit,
                staffTypeId: input.staffType,
                roleId: input.role,
              })
              .returning([
                "User.id",
                "User.email",
                "User.name",
                "User.organizationUnitId",
                "User.staffTypeId",
                "User.roleId",
              ]),
          )
          .with("staffDetails", (db) =>
            db
              .selectFrom("newStaff")
              .leftJoin(
                "OrganizationUnit",
                "newStaff.organizationUnitId",
                "OrganizationUnit.id",
              )
              .leftJoin("StaffType", "newStaff.staffTypeId", "StaffType.id")
              .leftJoin("Role", "newStaff.roleId", "Role.id")
              .select([
                "newStaff.id",
                "newStaff.email",
                "newStaff.name",
                "OrganizationUnit.name as organizationUnit",
                "StaffType.name as staffType",
                "Role.role as role",
              ]),
          )
          .with("accessRights", (db) =>
            db.insertInto("UserAccessRights").values(accessRightsToBeAdded),
          )
          .selectFrom("staffDetails")
          .select([
            "staffDetails.id",
            "staffDetails.email",
            "staffDetails.name",
            "staffDetails.organizationUnit",
            "staffDetails.staffType",
            "staffDetails.role",
          ])
          .execute();

        return {
          id: result?.id ?? "",
          email: result?.email ?? "",
          name: result?.name ?? "",
          organizationUnit: result?.organizationUnit ?? "",
          staffType: result?.staffType ?? "",
          role: result?.role ?? "",
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getStaff: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.db
          .selectFrom("User")
          .select([
            "User.id",
            "User.email",
            "User.name",
            "User.mobile",
            "User.organizationUnitId as organizationUnit",
            "User.staffTypeId as staffType",
            "User.roleId as role",
          ])
          .where("User.id", "=", input.id)
          .executeTakeFirst();

        return {
          id: user?.id ?? "",
          email: user?.email ?? "",
          name: user?.name ?? "",
          mobile: user?.mobile ?? "",
          organizationUnit: user?.organizationUnit ?? "",
          staffType: user?.staffType ?? "",
          role: user?.role ?? "",
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getStaffAccessRights: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const data = await ctx.db
          .selectFrom("UserAccessRights")
          .leftJoin("User", "UserAccessRights.grantedById", "User.id")
          .leftJoin(
            "AccessRights",
            "UserAccessRights.accessRightId",
            "AccessRights.id",
          )
          .select([
            "AccessRights.id",
            "AccessRights.pageName",
            "AccessRights.pageLink",
            "User.name as grantedBy",
          ])
          .where("UserAccessRights.grantedUserId", "=", input.id)
          .execute();

        return data.map((accessRight) => ({
          id: accessRight.id ?? "",
          pageName: accessRight.pageName ?? "",
          pageLink: accessRight.pageLink ?? "",
          grantedBy: accessRight.grantedBy ?? "",
        }));
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  updateStaff: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        newId: z.string().min(1),
        name: z.string().min(1),
        email: z.string().email(),
        mobile: z
          .string()
          .regex(/^\d{8}$/)
          .optional()
          .or(z.literal("")),
        password: z.string().optional().or(z.literal("")),
        organizationUnit: z.string().min(1),
        staffType: z.string().min(1),
        role: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const hashed_password =
          input.password?.trim() && (await new Argon2id().hash(input.password));

        const role = await ctx.db
          .selectFrom("User")
          .select(["User.roleId"])
          .where("User.id", "=", input.id)
          .executeTakeFirst();

        if (role?.roleId !== input.role) {
          console.log("Role changed", role?.roleId, input.role);
          const [existingAccessRights, oldAccessRights, newAccessRights] =
            await Promise.all([
              ctx.db
                .selectFrom("UserAccessRights")
                .select(["accessRightId"])
                .where("grantedUserId", "=", input.id)
                .execute(),
              ctx.db
                .selectFrom("AccessRightsOnRoles")
                .select(["accessRightId"])
                .where("roleId", "=", role?.roleId ?? "")
                .execute(),
              ctx.db
                .selectFrom("AccessRightsOnRoles")
                .select(["accessRightId"])
                .where("roleId", "=", input.role)
                .execute(),
            ]);

          const independentAccessRights = existingAccessRights.filter(
            (existing) =>
              !oldAccessRights.some(
                (old) => old.accessRightId === existing.accessRightId,
              ),
          );

          const accessRightsToBeAdded = newAccessRights.filter(
            (newAccess) =>
              !independentAccessRights.some(
                (independent) =>
                  independent.accessRightId === newAccess.accessRightId,
              ),
          );

          await ctx.db.transaction().execute(async (trx) => {
            await trx
              .deleteFrom("UserAccessRights")
              .where("grantedUserId", "=", input.id)
              .where(
                "accessRightId",
                "in",
                oldAccessRights.map((accessRight) => accessRight.accessRightId),
              )
              .execute();
            await trx
              .insertInto("UserAccessRights")
              .values(
                accessRightsToBeAdded.map((accessRight) => ({
                  id: createId(),
                  accessRightId: accessRight.accessRightId,
                  grantedUserId: input.id,
                  grantedById: ctx.user.id,
                })),
              )
              .execute();
            return;
          });
        }

        const staff = await ctx.db
          .updateTable("User")
          .set({
            id: input.newId,
            name: input.name,
            email: input.email,
            mobile: input.mobile?.trim() === "" ? null : input.mobile,
            ...(hashed_password && { hashed_password }),
            organizationUnitId: input.organizationUnit,
            staffTypeId: input.staffType,
            roleId: input.role,
          })
          .where("id", "=", input.id)
          .returning(["User.id", "User.email", "User.name", "User.mobile"])
          .executeTakeFirst();

        const returnedAccessRights = await ctx.db
          .selectFrom("UserAccessRights")
          .leftJoin(
            "AccessRights",
            "UserAccessRights.accessRightId",
            "AccessRights.id",
          )
          .leftJoin("User", "UserAccessRights.grantedById", "User.id")
          .select([
            "AccessRights.id",
            "AccessRights.pageName",
            "AccessRights.pageLink",
            "User.name as grantedBy",
          ])
          .where("UserAccessRights.grantedUserId", "=", input.newId)
          .execute();

        return {
          id: staff?.id ?? "",
          email: staff?.email ?? "",
          name: staff?.name ?? "",
          mobile: staff?.mobile ?? "",
          organizationUnit: input.organizationUnit,
          staffType: input.staffType,
          role: input.role,
          accessRights: returnedAccessRights.map((accessRight) => ({
            id: accessRight.id ?? "",
            pageName: accessRight.pageName ?? "",
            pageLink: accessRight.pageLink ?? "",
            grantedBy: accessRight.grantedBy ?? "",
          })),
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteAccessRightFromStaff: protectedProcedure
    .input(z.object({ id: z.string().min(1), staffId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .deleteFrom("UserAccessRights")
          .where("grantedUserId", "=", input.staffId)
          .where("accessRightId", "=", input.id)
          .execute();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getUserAvailableAccessRights: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .selectFrom("AccessRights")
          .selectAll()
          .where(({ not, selectFrom, exists }) =>
            not(
              exists(
                selectFrom("UserAccessRights")
                  .select("UserAccessRights.accessRightId")
                  .whereRef(
                    "UserAccessRights.accessRightId",
                    "=",
                    "AccessRights.id",
                  )
                  .where("UserAccessRights.grantedUserId", "=", input.id),
              ),
            ),
          )
          .execute();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  addAcccessRightToStaff: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        accessRights: z.array(z.string().min(1)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const data = await ctx.db.transaction().execute(async (trx) => {
          await trx
            .insertInto("UserAccessRights")
            .values(
              input.accessRights.map((accessRight) => ({
                id: createId(),
                accessRightId: accessRight,
                grantedUserId: input.id,
                grantedById: ctx.user.id,
              })),
            )
            .execute();
          return await trx
            .selectFrom("UserAccessRights")
            .leftJoin(
              "AccessRights",
              "UserAccessRights.accessRightId",
              "AccessRights.id",
            )
            .leftJoin("User", "UserAccessRights.grantedById", "User.id")
            .select([
              "AccessRights.id",
              "AccessRights.pageName",
              "AccessRights.pageLink",
              "User.name as grantedBy",
            ])
            .where("UserAccessRights.grantedUserId", "=", input.id)
            .execute();
        });
        return data.map((accessRight) => ({
          id: accessRight.id ?? "",
          pageName: accessRight.pageName ?? "",
          pageLink: accessRight.pageLink ?? "",
          grantedBy: accessRight.grantedBy ?? "",
        }));
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getRoleDetails: protectedProcedure
    .input(z.object({ roleId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const data = await ctx.db
          .selectFrom("Role")
          .select((eb) => [
            "id",
            "role",
            jsonArrayFrom(
              eb
                .selectFrom("AccessRightsOnRoles")
                .leftJoin(
                  "AccessRights",
                  "AccessRightsOnRoles.accessRightId",
                  "AccessRights.id",
                )
                .select([
                  "AccessRights.id",
                  "AccessRights.pageName",
                  "AccessRights.pageLink",
                ])
                .where("roleId", "=", input.roleId),
            ).as("accessRights"),
          ])
          .where("id", "=", input.roleId)
          .executeTakeFirst();
        return {
          id: data?.id ?? "",
          role: data?.role ?? "",
          accessRights:
            data?.accessRights.map((accessRight) => ({
              id: accessRight.id ?? "",
              pageName: accessRight.pageName ?? "",
              pageLink: accessRight.pageLink ?? "",
            })) ?? [],
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  updateRoleDetails: protectedProcedure
    .input(z.object({ id: z.string().min(1), role: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .updateTable("Role")
          .set({
            role: input.role,
          })
          .where("id", "=", input.id)
          .returning(["id", "role"])
          .executeTakeFirstOrThrow();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteAccessRightFromRole: protectedProcedure
    .input(
      z.object({ roleId: z.string().min(1), accessRightId: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .deleteFrom("AccessRightsOnRoles")
          .where("roleId", "=", input.roleId)
          .where("accessRightId", "=", input.accessRightId)
          .execute();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getRoleAvailableAccessRights: protectedProcedure
    .input(z.object({ roleId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db
          .selectFrom("AccessRights")
          .selectAll()
          .where(({ not, selectFrom, exists }) =>
            not(
              exists(
                selectFrom("AccessRightsOnRoles")
                  .select("AccessRightsOnRoles.accessRightId")
                  .whereRef(
                    "AccessRightsOnRoles.accessRightId",
                    "=",
                    "AccessRights.id",
                  )
                  .where("AccessRightsOnRoles.roleId", "=", input.roleId),
              ),
            ),
          )
          .execute();
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  addAccessRightsToRole: protectedProcedure
    .input(
      z.object({
        roleId: z.string().min(1),
        accessRights: z.array(z.string().min(1)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const data = await ctx.db.transaction().execute(async (trx) => {
          await trx
            .insertInto("AccessRightsOnRoles")
            .values(
              input.accessRights.map((accessRight) => ({
                roleId: input.roleId,
                accessRightId: accessRight,
              })),
            )
            .execute();
          return await trx
            .selectFrom("AccessRightsOnRoles")
            .leftJoin(
              "AccessRights",
              "AccessRightsOnRoles.accessRightId",
              "AccessRights.id",
            )
            .select([
              "AccessRights.id",
              "AccessRights.pageName",
              "AccessRights.pageLink",
            ])
            .where("AccessRightsOnRoles.roleId", "=", input.roleId)
            .execute();
        });

        return data.map((accessRight) => ({
          id: accessRight.id ?? "",
          pageName: accessRight.pageName ?? "",
          pageLink: accessRight.pageLink ?? "",
        }));
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getAllStudents: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db
        .selectFrom("User")
        .leftJoin("Course", "User.courseId", "Course.id")
        .select([
          "User.id",
          "User.email",
          "User.name",
          "User.graduationDate",
          "Course.name as course",
          "User.batch",
        ])
        .where("User.staffTypeId", "is", null)
        .execute();
      return data.map((student) => ({
        ...student,
        batch: student.batch ?? "",
        course: student.course ?? "",
        graduationDate:
          student.graduationDate?.toLocaleDateString("en-SG") ?? "",
      }));
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getAllActiveCourses: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db
        .selectFrom("Course")
        .select(["id", "name", "code"])
        .where("active", "=", true)
        .execute();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  addStudent: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        email: z.string().email(),
        name: z.string().min(1),
        course: z.string().min(1),
        batch: z.string().min(1),
        graduationDate: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const role = await ctx.db
          .selectFrom("Role")
          .select((eb) => [
            "id",
            "role",
            jsonArrayFrom(
              eb
                .selectFrom("AccessRightsOnRoles")
                .select(["AccessRightsOnRoles.accessRightId"])
                .whereRef("AccessRightsOnRoles.roleId", "=", eb.ref("Role.id")),
            ).as("accessRights"),
          ])
          .where("role", "=", "Student")
          .executeTakeFirstOrThrow();

        const student = await ctx.db
          .with("newStudent", (db) =>
            db
              .insertInto("User")
              .values({
                id: input.id,
                email: input.email,
                name: input.name,
                courseId: input.course,
                batch: input.batch,
                graduationDate: input.graduationDate,
                roleId: role.id,
              })
              .returning([
                "User.id",
                "User.email",
                "User.name",
                "User.courseId",
                "User.batch",
                "User.graduationDate",
              ]),
          )
          .with("studentDetails", (db) =>
            db
              .selectFrom("newStudent")
              .leftJoin("Course", "newStudent.courseId", "Course.id")
              .select([
                "newStudent.id",
                "newStudent.email",
                "newStudent.name",
                "Course.name as course",
                "newStudent.batch",
                "newStudent.graduationDate",
              ]),
          )
          .with("accessRights", (db) =>
            db.insertInto("UserAccessRights").values(
              role.accessRights.map((accessRight) => ({
                id: createId(),
                accessRightId: accessRight.accessRightId ?? "",
                grantedUserId: input.id,
                grantedById: ctx.user.id,
              })),
            ),
          )
          .selectFrom("studentDetails")
          .select([
            "studentDetails.id",
            "studentDetails.email",
            "studentDetails.name",
            "studentDetails.course",
            "studentDetails.batch",
            "studentDetails.graduationDate",
          ])
          .executeTakeFirstOrThrow();
        return {
          ...student,
          batch: student?.batch ?? "",
          course: student?.course ?? "",
          graduationDate:
            student?.graduationDate?.toLocaleDateString("en-SG") ?? "",
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  bulkAddStudents: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string().min(1),
          email: z.string().email(),
          name: z.string().min(1),
          course: z.string().min(1),
          batch: z.string().min(1),
          graduationDate: z.union([z.date(), z.string()]),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.db.transaction().execute(async (trx) => {
          const role = await trx
            .selectFrom("Role")
            .select((eb) => [
              "id",
              "role",
              jsonArrayFrom(
                eb
                  .selectFrom("AccessRightsOnRoles")
                  .select(["AccessRightsOnRoles.accessRightId"])
                  .whereRef(
                    "AccessRightsOnRoles.roleId",
                    "=",
                    eb.ref("Role.id"),
                  ),
              ).as("accessRights"),
            ])
            .where("role", "=", "Student")
            .executeTakeFirstOrThrow();

          const studentsToInsert = input.map((student) => ({
            id: student.id,
            email: student.email,
            name: student.name,
            courseId: student.course,
            batch: student.batch,
            graduationDate: student.graduationDate,
            roleId: role.id,
          }));

          await trx.insertInto("User").values(studentsToInsert).execute();

          const userAccessRights = studentsToInsert.flatMap((student) =>
            role.accessRights.map((accessRight) => ({
              id: createId(),
              accessRightId: accessRight.accessRightId ?? "",
              grantedUserId: student.id,
              grantedById: ctx.user.id,
            })),
          );

          await trx
            .insertInto("UserAccessRights")
            .values(userAccessRights)
            .execute();

          const insertedStudentIds = studentsToInsert.map(
            (student) => student.id,
          );
          const students = await trx
            .selectFrom("User")
            .where("User.id", "in", insertedStudentIds)
            .leftJoin("Course", "User.courseId", "Course.id")
            .select([
              "User.id",
              "User.email",
              "User.name",
              "Course.name as course",
              "User.batch",
              "User.graduationDate",
            ])
            .execute();

          return students.map((student) => ({
            ...student,
            graduationDate:
              student.graduationDate?.toLocaleDateString("en-SG") ?? "",
            batch: student.batch ?? "",
            course: student.course ?? "",
          }));
        });

        return result;
      } catch (err) {
        console.error(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteStudent: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .deleteFrom("User")
          .where("id", "=", input.id)
          .executeTakeFirst();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getStudent: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const user = await ctx.db
          .selectFrom("User")
          .select([
            "id",
            "email",
            "name",
            "mobile",
            "courseId as course",
            "batch",
            "graduationDate",
          ])
          .where("id", "=", input.id)
          .executeTakeFirst();

        return {
          id: user?.id ?? "",
          email: user?.email ?? "",
          name: user?.name ?? "",
          mobile: user?.mobile ?? "",
          course: user?.course ?? "",
          batch: user?.batch ?? "",
          graduationDate: user?.graduationDate ?? new Date(),
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getStudentAccessRights: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const data = await ctx.db
          .selectFrom("UserAccessRights")
          .leftJoin("User", "UserAccessRights.grantedById", "User.id")
          .leftJoin(
            "AccessRights",
            "UserAccessRights.accessRightId",
            "AccessRights.id",
          )
          .select([
            "AccessRights.id",
            "AccessRights.pageName",
            "AccessRights.pageLink",
            "User.name as grantedBy",
          ])
          .where("UserAccessRights.grantedUserId", "=", input.id)
          .execute();

        return data.map((accessRight) => ({
          id: accessRight.id ?? "",
          pageName: accessRight.pageName ?? "",
          pageLink: accessRight.pageLink ?? "",
          grantedBy: accessRight.grantedBy ?? "",
        }));
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  updateStudent: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        newId: z.string().min(1),
        name: z.string().min(1),
        email: z.string().email(),
        mobile: z
          .string()
          .regex(/^\d{8}$/)
          .optional()
          .or(z.literal("")),
        password: z.string().optional().or(z.literal("")),
        batch: z.string().min(1),
        graduationDate: z.date(),
        course: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const hashed_password =
          input.password?.trim() && (await new Argon2id().hash(input.password));

        const student = await ctx.db
          .updateTable("User")
          .set({
            id: input.newId,
            name: input.name,
            email: input.email,
            mobile: input.mobile?.trim() === "" ? null : input.mobile,
            ...(hashed_password && { hashed_password }),
            batch: input.batch,
            graduationDate: input.graduationDate,
            courseId: input.course,
          })
          .where("id", "=", input.id)
          .returning([
            "id",
            "email",
            "name",
            "mobile",
            "courseId",
            "batch",
            "graduationDate",
          ])
          .executeTakeFirst();
        return {
          id: student?.id ?? "",
          email: student?.email ?? "",
          name: student?.name ?? "",
          mobile: student?.mobile ?? "",
          course: student?.courseId ?? "",
          batch: student?.batch ?? "",
          graduationDate: student?.graduationDate ?? new Date(),
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  addAccessRightToStudent: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        accessRights: z.array(z.string().min(1)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const data = await ctx.db.transaction().execute(async (trx) => {
          await trx
            .insertInto("UserAccessRights")
            .values(
              input.accessRights.map((accessRight) => ({
                id: createId(),
                accessRightId: accessRight,
                grantedUserId: input.id,
                grantedById: ctx.user.id,
              })),
            )
            .execute();
          return await trx
            .selectFrom("UserAccessRights")
            .leftJoin(
              "AccessRights",
              "UserAccessRights.accessRightId",
              "AccessRights.id",
            )
            .leftJoin("User", "UserAccessRights.grantedById", "User.id")
            .select([
              "AccessRights.id",
              "AccessRights.pageName",
              "AccessRights.pageLink",
              "User.name as grantedBy",
            ])
            .where("UserAccessRights.grantedUserId", "=", input.id)
            .execute();
        });
        return data.map((accessRight) => ({
          id: accessRight.id ?? "",
          pageName: accessRight.pageName ?? "",
          pageLink: accessRight.pageLink ?? "",
          grantedBy: accessRight.grantedBy ?? "",
        }));
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteAccessRightFromStudent: protectedProcedure
    .input(z.object({ id: z.string().min(1), studentId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .deleteFrom("UserAccessRights")
          .where("grantedUserId", "=", input.studentId)
          .where("accessRightId", "=", input.id)
          .execute();
        return;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
