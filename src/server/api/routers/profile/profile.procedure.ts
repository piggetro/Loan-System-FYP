import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";
import { Argon2id } from "oslo/password";

export const profileRouter = createTRPCRouter({
    changePassword: protectedProcedure
        .input(
            z.object({
                oldPassword: z.string().min(1),
                newPassword: z.string().min(1),
                confirmPassword: z.string().min(1),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const dbPassword = await ctx.db.user.findUnique({
                    where: {
                        id: ctx.user.id,
                    },
                    select: {
                        hashed_password: true,
                    },
                });

                const hashedOldPassword = dbPassword?.hashed_password;

                const hashedInputOldPassword = await new Argon2id().hash(input.oldPassword);
                const hashedInputNewPassword = await new Argon2id().hash(input.newPassword);

                console.log(hashedOldPassword);
                console.log(hashedInputOldPassword);
                console.log(hashedInputNewPassword);

                // Check if hashed old password exists
                if (hashedOldPassword) {
                    const isCorrectOldPassword = await new Argon2id().verify(hashedOldPassword, input.oldPassword);

                    if (isCorrectOldPassword) {
                        return await ctx.db.user.update({
                            where: {
                                id: ctx.user.id,
                            },
                            data: {
                                hashed_password: hashedInputNewPassword
                            },
                        });

                    } else {
                        //console.log("Incorrect password");
                        return null;
                    }
                }
            } catch (err) {
                console.log(err);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }
        }),
    updateParticulars: protectedProcedure
        .input(
            z.object({
                email: z.string().email(),
                mobile: z
                    .string()
                    .regex(/^\d{8}$/)
                    .optional()
                    .or(z.literal("")),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const data = await ctx.db.user.update({
                    where: {
                        id: ctx.user.id,
                    },
                    data: {
                        email: input.email,
                        mobile: input.mobile?.trim() === "" ? null : input.mobile,
                    },
                    select: {
                        email: true,
                        mobile: true,
                    },
                });
                return {
                    email: data?.email ?? "",
                    mobile: data?.mobile ?? "",
                };
            } catch (err) {
                console.log(err);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }
        }),

    getParticulars: protectedProcedure.query(async ({ ctx }) => {
        try {
            const data = await ctx.db.user.findUnique({
                where: {
                    id: ctx.user.id,
                },
                select: {
                    name: true,
                    id: true,
                    email: true,
                    mobile: true,
                    course: true,
                    role: true,
                    organizationUnit: true,
                    staffType: true,
                },
            });

            return {
                name: data?.name ?? "",
                id: data?.id ?? "",
                email: data?.email ?? "",
                mobile: data?.mobile ?? "",
                course: data?.course?.name ?? "",
                role: data?.role?.id ?? "",
                organizationUnit: data?.organizationUnit?.name ?? "",
                staffType: data?.staffType?.name ?? "",
            };
        } catch (err) {
            console.log(err);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
    })
});