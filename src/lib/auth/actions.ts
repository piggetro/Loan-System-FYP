/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint @typescript-eslint/no-explicit-any:0, @typescript-eslint/prefer-optional-chain:0 */
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { lucia } from "@/lib/auth";
import { db } from "@/server/db";
import { validateRequest } from "@/lib/auth/validate-request";
import { Argon2id } from "oslo/password";
import sendRegistrationEmail from "../email/registration-email";
import { generate } from "generate-password";

export interface ActionResponse<T> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
}

export async function login(adminId: string, password: string) {
  console.log(await new Argon2id().hash(password));
  return await db.user
    .findUnique({
      where: {
        id: adminId,
      },
    })
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
  return redirect("login");
}

export async function register(adminId: string, mobile: string) {
  return await db.user
    .findUnique({
      where: {
        id: adminId,
      },
    })
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
        await db.user.update({
          where: { id: adminId },
          data: { mobile: mobile, hashed_password: hashed_password },
        });
        return {
          title: "Registration Successful",
          description: "An email has been sent to your iChat email address containing your password. You may log in.",
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

export async function resetPassword(adminId: string, email: string) {
  return await db.user
    .findUnique({
      where: {
        id: adminId,
      },
    })
    .then(async (results) => {
      if (results == null) {
        return {
          title: "Password Reset Failed",
          description: "Admin ID is invalid",
          variant: "destructive",
        };
      }
      if (results.hashed_password == null) {
        return {
          title: "Password Reset Failed",
          description: "Admin ID is not registered",
          variant: "destructive",
        };
      }
      if (results.email == undefined) {
        return {
          title: "Password Reset Failed",
          description: "Account issue, please contact service desk.",
          variant: "destructive",
        };
      }
      if (results.email != email) {
        return {
          title: "Password Reset Failed",
          description: "Incorrect email address",
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
        await db.user.update({
          where: { id: adminId },
          data: { hashed_password: hashed_password },
        });
        return {
          title: "Password Reset",
          description: "An email has been sent to your iChat email address containing the new password.",
        };
      } catch (error) {
        return {
          title: "Password Reset Failed",
          description: "An error occurred in resetting your password.",
          variant: "destructive",
        };
      }
    })
    .catch(() => {
      throw {
        title: "Password Reset Failed",
        description: "Please contact service desk",
        variant: "destructive",
      };
    });
}
