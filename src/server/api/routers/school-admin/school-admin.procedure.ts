import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import page from "@/app/(protected)/page";
import { Argon2id } from "oslo/password";

export const schoolAdminRouter = createTRPCRouter({
  getAccessRights: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.accessRights.findMany();
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
        return await ctx.db.accessRights.update({
          where: {
            id: input.id,
          },
          data: {
            pageName: input.pageName,
            pageLink: input.pageLink,
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  deleteAccessRight: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.accessRights.delete({
          where: {
            id: input.id,
          },
        });
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
        return await ctx.db.accessRights.create({
          data: {
            pageName: input.pageName,
            pageLink: input.pageLink,
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getAllRoles: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db.role.findMany({
        select: {
          id: true,
          role: true,
          _count: {
            select: {
              accessRights: true,
              users: true,
            },
          },
        },
      });
      return data.map((role) => ({
        id: role.id,
        role: role.role,
        accessRightsCount: role._count.accessRights,
        usersCount: role._count.users,
      }));
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  deleteRole: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.role.delete({
          where: {
            id: input.id,
          },
        });
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
        const role = await ctx.db.role.create({
          data: {
            role: input.role,
            accessRights: {
              create: input.accessRights.map((accessRight) => ({
                accessRight: {
                  connect: {
                    id: accessRight,
                  },
                },
              })),
            },
          },
        });
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
      const data = await ctx.db.user.findMany({
        where: {
          NOT: {
            organizationUnit: null,
            staffType: null,
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          organizationUnit: {
            select: {
              name: true,
            },
          },
          staffType: {
            select: {
              name: true,
            },
          },
          role: {
            select: {
              role: true,
            },
          },
        },
      });
      return data.map((staff) => ({
        ...staff,
        organizationUnit: staff.organizationUnit?.name!,
        staffType: staff.staffType?.name!,
        role: staff.role?.role!,
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
        return await ctx.db.user.delete({
          where: {
            id: input.id,
          },
        });
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  getAllOrganizationUnits: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.organizationUnit.findMany();
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  getAllStaffTypes: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.staffType.findMany();
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
        const data = await ctx.db.user.create({
          data: {
            id: input.id,
            email: input.email,
            name: input.name,
            organizationUnit: {
              connect: {
                id: input.organizationUnit,
              },
            },
            staffType: {
              connect: {
                id: input.staffType,
              },
            },
            role: {
              connect: {
                id: input.role,
              },
            },
          },
          select: {
            id: true,
            email: true,
            name: true,
            organizationUnit: {
              select: {
                name: true,
              },
            },
            staffType: {
              select: {
                name: true,
              },
            },
            role: {
              select: {
                role: true,
                accessRights: {
                  select: {
                    accessRightId: true,
                  },
                },
              },
            },
          },
        });
        await ctx.db.userAccessRights.createMany({
          data: data.role?.accessRights.map((accessRight) => ({
            accessRightId: accessRight.accessRightId,
            grantedUserId: input.id,
            grantedById: ctx.user.id,
          })) as any,
        });
        return {
          ...data,
          organizationUnit: data.organizationUnit?.name!,
          staffType: data.staffType?.name!,
          role: data.role?.role!,
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
        const data = await ctx.db.user.findUnique({
          where: {
            id: input.id,
          },
          select: {
            id: true,
            email: true,
            mobile: true,
            name: true,
            organizationUnit: {
              select: {
                id: true,
              },
            },
            staffType: {
              select: {
                id: true,
              },
            },
            role: {
              select: {
                id: true,
              },
            },
            accessRightsGranted: {
              select: {
                accessRight: true,
              },
            },
          },
        });
        return {
          id: data?.id!,
          email: data?.email!,
          mobile: data?.mobile || "",
          name: data?.name!,
          organizationUnit: data?.organizationUnit?.id!,
          staffType: data?.staffType?.id!,
          role: data?.role?.id!,
          accessRightsGranted: data?.accessRightsGranted.map((accessRight) => ({
            id: accessRight.accessRight.id,
            pageName: accessRight.accessRight.pageName,
            pageLink: accessRight.accessRight.pageLink,
          }))!,
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
        const data = await ctx.db.user.findUnique({
          where: {
            id: input.id,
          },
          select: {
            accessRightsGranted: {
              select: {
                accessRight: true,
                grantedBy: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });
        return data?.accessRightsGranted.map((accessRight) => ({
          id: accessRight.accessRight.id,
          pageName: accessRight.accessRight.pageName,
          pageLink: accessRight.accessRight.pageLink,
          grantedBy: accessRight.grantedBy.name,
        }))!;
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  updateStaff: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
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
          input.password &&
          input.password.trim() &&
          (await new Argon2id().hash(input.password));

        const role = await ctx.db.user.findUnique({
          where: {
            id: input.id,
          },
          select: {
            roleId: true,
          },
        });

        if (role?.roleId !== input.role) {
          const [existingAccessRights, oldAccessRights, newAccessRights] =
            await Promise.all([
              ctx.db.userAccessRights.findMany({
                where: { grantedUserId: input.id },
                select: { accessRightId: true },
              }),
              ctx.db.accessRightsOnRoles.findMany({
                where: { roleId: role?.roleId! },
                select: { accessRightId: true },
              }),
              ctx.db.accessRightsOnRoles.findMany({
                where: { roleId: input.role },
                select: { accessRightId: true },
              }),
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

          await ctx.db.$transaction([
            ctx.db.userAccessRights.deleteMany({
              where: {
                grantedUserId: input.id,
                accessRightId: {
                  in: oldAccessRights.map(
                    (accessRight) => accessRight.accessRightId,
                  ),
                },
              },
            }),
            ctx.db.userAccessRights.createMany({
              data: accessRightsToBeAdded.map((accessRight) => ({
                accessRightId: accessRight.accessRightId,
                grantedUserId: input.id,
                grantedById: ctx.user.id,
              })),
            }),
          ]);
        }
        const staff = await ctx.db.user.update({
          where: {
            id: input.id,
          },
          data: {
            id: input.id,
            name: input.name,
            email: input.email,
            mobile: input.mobile?.trim() === "" ? null : input.mobile,
            ...(hashed_password && { hashed_password }),
            organizationUnit: {
              connect: {
                id: input.organizationUnit,
              },
            },
            staffType: {
              connect: {
                id: input.staffType,
              },
            },
            role: {
              connect: {
                id: input.role,
              },
            },
          },
          select: {
            id: true,
            email: true,
            mobile: true,
            name: true,
            organizationUnit: {
              select: {
                id: true,
              },
            },
            staffType: {
              select: {
                id: true,
              },
            },
            role: {
              select: {
                id: true,
              },
            },
            accessRightsGranted: {
              select: {
                accessRight: true,
                grantedBy: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });
        return {
          id: staff?.id!,
          email: staff?.email!,
          mobile: staff?.mobile || "",
          name: staff?.name!,
          organizationUnit: staff?.organizationUnit?.id!,
          staffType: staff?.staffType?.id!,
          role: staff?.role?.id!,
          accessRights: staff?.accessRightsGranted.map((accessRight) => ({
            id: accessRight.accessRight.id,
            pageName: accessRight.accessRight.pageName,
            pageLink: accessRight.accessRight.pageLink,
            grantedBy: accessRight.grantedBy.name,
          }))!,
        };
      } catch (err) {
        console.log(err);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
