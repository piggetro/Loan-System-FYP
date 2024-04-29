import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";

export const userRouter = createTRPCRouter({
  getAllAccessRights: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db.session.findUnique({
        where: {
          id: ctx.session.id,
        },
        include: {
          user: {
            select: {
              role: {
                select: {
                  accessRights: {
                    select: {
                      accessRight: {
                        select: {
                          pageLink: true,
                        },
                      },
                    },
                  },
                },
              },
              accessRightsGranted: {
                select: {
                  accessRight: {
                    select: {
                      pageLink: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      const accessRightsGrantedPageLinks =
        data &&
        data.user.accessRightsGranted.map(
          (access) => access.accessRight.pageLink,
        );
      const roleAccessRightsPageLinks =
        data?.user.role &&
        data.user.role.accessRights.map(
          (access) => access.accessRight.pageLink,
        );

      const combinedPageLinks =
        accessRightsGrantedPageLinks &&
        roleAccessRightsPageLinks &&
        accessRightsGrantedPageLinks.concat(roleAccessRightsPageLinks);

      return combinedPageLinks;
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
