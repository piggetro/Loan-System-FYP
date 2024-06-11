import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../../trpc";
import { z } from "zod";

export const staffTypesRouter = createTRPCRouter({
    getAllStaffTypes: protectedProcedure.query(async ({ ctx }) => {
        try {
            return await ctx.db.staffType.findMany();
        } catch (err) {
            console.log(err);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
    }),
    updateStaffType: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
                name: z.string().min(1),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            try {
                return await ctx.db.staffType.update({
                    where: {
                        id: input.id,
                    },
                    data: {
                        name: input.name,
                    },
                });
            } catch (err) {
                console.log(err);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }
        }),
    deleteStaffType: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            try {
                return await ctx.db.staffType.delete({
                    where: {
                        id: input.id,
                    },
                });
            } catch (err) {
                console.log(err);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }
        }),
    addStaffType: protectedProcedure
        .input(
            z.object({ name: z.string().min(1) }),
        )
        .mutation(async ({ ctx, input }) => {
            try {
                return await ctx.db.staffType.create({
                    data: {
                        name: input.name,
                    },
                });
            } catch (err) {
                console.log(err);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
            }
        }),
});