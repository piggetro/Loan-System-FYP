import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { db } from "@/database";

export const userRouter = createTRPCRouter({
  getAllAccessRights: protectedProcedure.query(async ({ ctx }) => {
    try {
      const testdata = await db
        .selectFrom("User")
        .innerJoin(
          "UserAccessRights",
          "User.id",
          "UserAccessRights.grantedUserId",
        )
        .innerJoin(
          "AccessRights",
          "UserAccessRights.accessRightId",
          "AccessRights.id",
        )
        .where("User.id", "=", ctx.user.id)
        .select("AccessRights.pageLink")
        .execute();

      return testdata.map((accessRight) => accessRight.pageLink);
    } catch (err) {
      console.log(err);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
