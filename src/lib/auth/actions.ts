/* eslint-disable @typescript-eslint/no-unsafe-return */
"use server";

/* eslint @typescript-eslint/no-explicit-any:0, @typescript-eslint/prefer-optional-chain:0 */

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { generateId, Scrypt } from "lucia";
import { isWithinExpirationDate, TimeSpan, createDate } from "oslo";
import { generateRandomString, alphabet } from "oslo/crypto";
import { lucia } from "@/lib/auth";
import { db } from "@/server/db";
import { validateRequest } from "@/lib/auth/validate-request";
import { env } from "@/env";
import { Argon2id } from "oslo/password";
import { useToast } from "@/app/_components/ui/use-toast";

export interface ActionResponse<T> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
}

export async function login(adminId: string, password: string) {
  return await db.user
    .findUnique({
      where: {
        id: adminId,
      },
    })
    .then(async (results) => {
      if (results == null || results.hashed_password == null) {
        return {
          error: "Login Failed",
          message: "Admin ID or Password is wrong",
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
      }
    })
    .catch((error) => {
      if (error == "Not Found") {
        throw {
          error: "Login Failed",
          message: "Admin ID or Password is wrong",
        };
      }
    });
}

export async function signup(adminId: string, password: string) {
  return null;
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
  return redirect("login");
}
