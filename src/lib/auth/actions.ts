/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint @typescript-eslint/no-explicit-any:0, @typescript-eslint/prefer-optional-chain:0 */
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia } from "@/lib/auth";
// import { db } from "@/server/db";
import { validateRequest } from "@/lib/auth/validate-request";
import { Argon2id } from "oslo/password";
import sendRegistrationEmail from "../email/registration-email";
import { generate } from "generate-password";
import { db } from "@/database";

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
          description: "Admin ID or Password is wrong",
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
        return redirect("/");
      } else {
        return {
          title: "Login Failed",
          description: "Admin ID or Password is wrong",
          variant: "destructive",
        };
      }
    })
    .catch((error) => {
      if (error == "Not Found") {
        throw {
          title: "Login Failed",
          description: "Admin ID or Password is wrong",
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
          description: "Admin ID is invalid",
          variant: "destructive",
        };
      }
      if (results.hashed_password != null) {
        return {
          title: "Registration Failed",
          description: "Admin ID is already registered",
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
        length: 10,
        numbers: true,
        symbols: true,
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
          description: "Admin ID is already registered",
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
