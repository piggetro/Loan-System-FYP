/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import React, { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import { useToast } from "@/app/_components/ui/use-toast";
import { createPasswordResetToken, login } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const ResetPasswordComponent = () => {
  const router = useRouter();
  const [adminId, setAdminId] = useState<string>("");
  const [isPending, setIsPending] = useState<boolean>(false);

  const { toast } = useToast();

  const performResetPasswordRequest = () => {
    setIsPending(true);
    createPasswordResetToken(adminId)
      .then((result) => {
        toast({
          title: result.title,
          description: result.description,
          variant: result.success ? "default" : "destructive",
        });
        setIsPending(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="mx-auto w-1/3 min-w-96">
      <div className="mb-4 rounded-xl bg-white px-8 pb-8 pt-6 shadow-lg">
        <h1 className="mb-4 text-2xl tracking-tight">Reset Password</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            performResetPasswordRequest();
          }}
        >
          <div className="">
            <Label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="email"
            >
              User ID
            </Label>
            <Input
              value={adminId}
              onChange={(e) => {
                setAdminId(e.target.value);
              }}
              id="adminId"
              placeholder="XXXXXXX"
              minLength={1}
              type="text"
              autoCapitalize="none"
              autoComplete="User Number"
              autoCorrect="off"
              disabled={isPending}
              className="mb-1"
            />

            <p className="mb-2 text-sm text-muted-foreground">
              Your School ID, pXXXXXXX, omit the &quot;p&quot;
            </p>
          </div>
          <Button disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
        <span className="mt-3 flex text-sm font-medium">
          Need to register?
          <div
            className="ml-1 hover:cursor-pointer hover:text-cyan-700"
            onClick={() => {
              router.push("register");
            }}
          >
            Register Here
          </div>
        </span>
        <span className="mt-1 flex text-sm font-medium">
          Need to Login?
          <div
            className="ml-1 hover:cursor-pointer hover:text-cyan-700"
            onClick={() => {
              router.push("login");
            }}
          >
            Login Here
          </div>
        </span>
      </div>
    </div>
  );
};

export default ResetPasswordComponent;
