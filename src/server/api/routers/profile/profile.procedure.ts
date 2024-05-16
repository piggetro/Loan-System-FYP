import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { Argon2id } from "oslo/password";

export const profileRouter = createTRPCRouter({
    changePassword: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
                oldPassword: z.string().min(1),
                newPassword: z.string().min(1),
                confirmPassword: z.string().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {

                const hashed_old_password_db = await ctx.db.user.findUnique({
                    where: {
                        id: ctx.user.id,
                    },
                    select: {
                        hashed_password: true,
                    },
                });

                console.log(hashed_old_password_db);

                const hashed_old_password = await new Argon2id().hash(input.oldPassword);
                const hashed_new_password = await new Argon2id().hash(input.newPassword);

                if (input.newPassword == input.confirmPassword) {
                    return await ctx.db.user.update({
                        where: {
                            id: ctx.user.id,
                            hashed_password: hashed_old_password
                        },
                        data: {
                            hashed_password: hashed_new_password
                        },
                    });
                }
            } catch (err) {
                console.log(err);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }
        })

});