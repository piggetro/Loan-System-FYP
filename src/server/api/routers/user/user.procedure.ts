import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";

export const userRouter = createTRPCRouter({
  getAllAccessRights: protectedProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db.session.findUnique({
        where: {
          id: ctx.session.id,
        },
        select: {
          user: {
            select: {
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

      return data?.user.accessRightsGranted.map(
        (accessRight) => accessRight.accessRight.pageLink,
      );
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
