import { z } from "zod";
import { Argon2id } from "oslo/password";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";

export const authenticationRouter = createTRPCRouter({
  firstTimeLogin: publicProcedure
    .input(z.object({ adminId: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = await new Argon2id().hash(input.password);
      try {
        await ctx.db.user.update({
          where: {
            id: input.adminId,
          },
          data: {
            hashed_password: hashedPassword,
          },
        });
        const session = await lucia.createSession(input.adminId, {});

        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set("hello", "bye");
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
        cookies().getAll();

        // const session = await lucia.createSession(userId, {});
        return;
      } catch (error) {
        console.log("error", error);
      }
    }),
});
