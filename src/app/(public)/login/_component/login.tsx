/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import React, { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import { useToast } from "@/app/_components/ui/use-toast";
import { login } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const LoginComponent = () => {
  const router = useRouter();
  const [isLoading] = useState<boolean>(false);
  const [adminId, setAdminId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);

  const { toast } = useToast();

  const performLogin = () => {
    setIsPending(true);
    login(adminId, password)
      .then((result) => {
        if (result?.title != undefined) {
          toast({
            title: result.title,
            description: result.description,
            variant:
              result.variant == "destructive" || result.variant == "default"
                ? result.variant
                : null,
          });
        }
        setIsPending(false);
      })
      .catch((error) => {
        console.log(error);
        setIsPending(false);
      });
  };

  return (
    <div className="mx-auto w-1/3 min-w-96">
      <div className="mb-4 rounded-xl bg-white px-8 pb-8 pt-6 shadow-lg">
        <h1 className="mb-4 text-2xl tracking-tight">Welcome</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            performLogin();
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
            <div className="mb-2 flex items-center text-sm">
              <Label
                className="block w-1/2 font-bold text-gray-700"
                htmlFor="email"
              >
                Password
              </Label>
              <div
                className="flex w-1/2 justify-end font-medium hover:cursor-pointer hover:text-cyan-700"
                onClick={() => {
                  setShowPassword(!showPassword);
                }}
              >
                {showPassword ? "Hide Password" : "Show Password"}
              </div>
            </div>
            <Input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              id="password"
              placeholder="Password Input"
              minLength={1}
              type={showPassword ? "text" : "password"}
              autoCapitalize="none"
              autoComplete="Password"
              autoCorrect="off"
              disabled={isLoading}
              className="mb-5"
            />
          </div>
          <Button disabled={isLoading} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>
        <span className="mt-2 flex text-sm font-regular">
          Forgot your password?
          <div className="ml-1 hover:cursor-pointer hover:text-cyan-700 font-medium"
          onClick={() => {
            router.push("reset-password");
          }}>Reset Password
        </div>
        </span>
        <span className="mt-2 flex text-sm font-regular">
          Need to register?
          <div
            className="ml-1 hover:cursor-pointer hover:text-cyan-700 font-medium"
            onClick={() => {
              router.push("register");
            }}
          >
            Register Account
          </div>
        </span>
      </div>
    </div>
  );
};

export default LoginComponent;
