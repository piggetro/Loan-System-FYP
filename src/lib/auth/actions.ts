/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint @typescript-eslint/no-explicit-any:0, @typescript-eslint/prefer-optional-chain:0 */
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia } from "@/lib/auth";
// import { db } from "@/server/db";
import { validateRequest } from "@/lib/auth/validate-request";
import { Argon2id } from "oslo/password";
import { generate } from "generate-password";
import { db } from "@/database";
import { generateIdFromEntropySize } from "lucia";
import { sha256 } from "oslo/crypto";
import { encodeHex } from "oslo/encoding";
import { createDate, isWithinExpirationDate, TimeSpan } from "oslo";
import { sendPasswordResetEmail, sendRegistrationEmail } from "../email/emails";
import { env } from "process";
import { TRPCError } from "@trpc/server";

export interface ActionResponse<T> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
}

export async function login(adminId: string, password: string) {
  return db
    .selectFrom("User")
    .selectAll()
    .where("User.id", "=", adminId)
    .executeTakeFirst()
    .then(async (results) => {
      if (results == null || results.hashed_password == null) {
        return {
          title: "Login Failed",
          description: "User ID or Password is wrong",
          variant: "destructive",
        };
      }
      const validatePassword = await new Argon2id().verify(
        results.hashed_password,
        password,
      );
      if (validatePassword == true) {
        const session = await lucia.createSession(adminId, {});

        const sessionCookie = lucia.createSessionCookie(session.id);

        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
        return {
          success: true,
        };
      } else {
        return {
          title: "Login Failed",
          description: "User ID or Password is wrong",
          variant: "destructive",
        };
      }
    })
    .catch((error) => {
      if (error == "Not Found") {
        throw {
          title: "Login Failed",
          description: "User ID or Password is wrong",
          variant: "destructive",
        };
      }
      console.log(error);
    });
}

export async function logout(): Promise<{ error: string }> {
  const { session } = await validateRequest();
  if (!session) {
    return {
      error: "No User was Logged In",
    };
  }
  await lucia.invalidateSession(session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );
  return redirect("/login");
}

export async function register(adminId: string, mobile: string) {
  return db
    .selectFrom("User")
    .selectAll()
    .where("User.id", "=", adminId)
    .executeTakeFirst()
    .then(async (results) => {
      if (results == null) {
        return {
          title: "Registration Failed",
          description: "User ID is invalid",
          variant: "destructive",
        };
      }
      if (results.hashed_password != null) {
        return {
          title: "Registration Failed",
          description: "User ID is already registered",
          variant: "destructive",
        };
      }
      if (results.email == undefined) {
        return {
          title: "Registration Failed",
          description: "Account Issue, Please contact service desk",
          variant: "destructive",
        };
      }
      const password = generate({
        length: 12,
        numbers: true,
        symbols: true,
        uppercase: true,
        lowercase: true,
      });
      sendRegistrationEmail(results?.email, password).catch((error) => {
        console.log(error);
      });
      //Email Verification
      const hashed_password = await new Argon2id().hash(password);
      try {
        await db
          .updateTable("User")
          .set({
            mobile: mobile,
            hashed_password: hashed_password,
          })
          .where("User.id", "=", adminId)
          .executeTakeFirst();
        return {
          title: "Registration Successful",
          description: "You may now login",
        };
      } catch (error) {
        return {
          title: "Registration Failed",
          description: "User ID is already registered",
          variant: "destructive",
        };
      }
    })
    .catch(() => {
      throw {
        title: "Registration Failed",
        description: "Please contact service desk",
        variant: "destructive",
      };
    });
}

export async function createPasswordResetToken(
  adminId: string,
): Promise<{ title: string; description: string; success: boolean }> {
  try {
    const userData = await db
      .selectFrom("User")
      .select("User.email")
      .where("User.id", "=", adminId)
      .executeTakeFirstOrThrow();
    return await db.transaction().execute(async (trx) => {
      await trx
        .deleteFrom("PasswordResetToken")
        .where("PasswordResetToken.user_id", "=", adminId)
        .execute();

      const tokenId = generateIdFromEntropySize(25); // 40 character
      const tokenHash = encodeHex(
        await sha256(new TextEncoder().encode(tokenId)),
      );

      await trx
        .insertInto("PasswordResetToken")
        .values({
          token_hash: tokenHash,
          user_id: adminId,
          expires_at: createDate(new TimeSpan(2, "h")),
        })
        .execute();

      await sendPasswordResetEmail(
        userData.email,
        env.DOMAIN + `/reset-password/${tokenId}`,
      );

      return {
        title: "Password Reset Request Sent",
        description: "Please check your inbox to reset password",
        success: true,
      };
    });
  } catch (error) {
    console.log(error);
    return {
      title: "Error Occurred",
      description: "Please check that the User ID is valid",
      success: false,
    };
  }
}
export async function verifyToken(
  verificationToken: string,
): Promise<{ user_id: string | undefined; success: boolean }> {
  try {
    const tokenHash = encodeHex(
      await sha256(new TextEncoder().encode(verificationToken)),
    );

    const token = await db
      .selectFrom("PasswordResetToken")
      .selectAll()
      .where("PasswordResetToken.token_hash", "=", tokenHash)
      .executeTakeFirst();

    if (token) {
      await db
        .deleteFrom("PasswordResetToken")
        .where("PasswordResetToken.token_hash", "=", tokenHash)
        .execute();
    }
    if (!token || !isWithinExpirationDate(token.expires_at)) {
      return { user_id: undefined, success: false };
    }
    await lucia.invalidateUserSessions(token.user_id);
    return { user_id: token.user_id, success: true };
  } catch (error) {
    return { user_id: undefined, success: false };
  }
}

export async function resetPassword(
  user_id: string,
  password: string,
): Promise<{ title: string; description: string; success: boolean }> {
  try {
    const hashed_password = await new Argon2id().hash(password);
    await db
      .updateTable("User")
      .where("User.id", "=", user_id)
      .set({ hashed_password: hashed_password })
      .execute();

    return {
      title: "Successfully resetted password",
      description: "Redirecting you to login ",
      success: true,
    };
  } catch (error) {
    return {
      title: "An Unexpected error occurred please try again later",
      description: "",
      success: false,
    };
  }
}
