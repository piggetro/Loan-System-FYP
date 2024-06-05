/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import React, { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import { useToast } from "@/app/_components/ui/use-toast";
import { register, resetPassword } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";

const ResetComponent = () => {
  const router = useRouter();
  const [isLoading] = useState<boolean>(false);
  const [adminId, setAdminId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const { toast } = useToast();

  const performReset = () => {
    if (adminId.length == 0) {
      toast({
        title: "Admin ID not entered",
        description: "Please enter Admin ID",
        variant: "destructive",
      });
      return;
    }
    if (email.length == 0) {
      toast({
        title: "Email not entered",
        description: "Please enter email address",
        variant: "destructive",
      });
      return;
    }
    resetPassword(adminId, email)
      .then((result) => {
        if (result?.title != undefined) {
          toast({
            title: result.title,
            description: result.description,
            variant: result.variant ? "destructive" : "default",
          });
        }
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
            performReset();
          }}
        >
          <div className="">
            <Label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="email"
            >
              Admin ID
            </Label>
            <Input
              value={adminId}
              onChange={(e) => {
                setAdminId(e.target.value);
              }}
              id="adminId"
              placeholder="Admin ID Input"
              minLength={1}
              type="text"
              autoCapitalize="none"
              autoComplete="Admin Number"
              autoCorrect="off"
              disabled={isLoading}
              className="mb-3"
            />
            <Label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="email"
            >
              Email
            </Label>
            <Input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              id="email"
              placeholder="Email Input"
              minLength={1}
              type="email"
              autoCapitalize="none"
              autoComplete="Admin Number"
              autoCorrect="off"
              disabled={isLoading}
              className="mb-3"
            />
          </div>
          <Button disabled={isLoading} className="w-full">
            Reset Password
          </Button>
        </form>
        <span className="mt-2 flex  text-sm font-regular">
          Go back to login page?
          <div
            className="ml-1 hover:cursor-pointer hover:text-cyan-700 font-medium"
            onClick={() => {
              router.push("login");
            }}
          >
            Login
          </div>
        </span>
      </div>
    </div>
  );
};

export default ResetComponent;
