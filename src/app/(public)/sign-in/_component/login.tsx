"use client";

import React, { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import { useToast } from "@/app/_components/ui/use-toast";
import { api } from "@/trpc/react";
import { authenticationRouter } from "@/server/api/routers/authentication";
import { useRouter } from "next/navigation";

const LoginComponent = () => {
  const router = useRouter();
  const [isLoading] = useState<boolean>(false);
  const [adminId, setAdminId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [signedIn, setSignedIn] = useState<boolean>(false);

  const { toast } = useToast();
  const authentication = api.authentication.firstTimeLogin.useMutation();

  const login = async () => {
    await authentication
      .mutateAsync({
        adminId: adminId,
        password: password,
      })
      .then(() => {
        // router.push("/");
      })
      .catch(() => {
        return false;
      });
  };

  return (
    <div className="mx-auto w-1/3 min-w-96">
      {signedIn && (
        <div
          data-testid="notify-email-sent"
          className="rounded-md bg-green-50 p-4"
        >
          <div className="flex">
            <div className="flex-shrink-0"></div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Check your inbox for the login link
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="mb-4 rounded-xl bg-white px-8 pb-8 pt-6 shadow-lg">
        <h1 className="mb-4 text-2xl tracking-tight">Welcome</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            login();
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
            />
            <Label
              className="mb-2 block text-sm font-bold text-gray-700"
              htmlFor="email"
            >
              Password
            </Label>
            <Input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              id="password"
              placeholder="Password Input"
              minLength={1}
              type="password"
              autoCapitalize="none"
              autoComplete="Password"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <Button disabled={isLoading} className="w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginComponent;
