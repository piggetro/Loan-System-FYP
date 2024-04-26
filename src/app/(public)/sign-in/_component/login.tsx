/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import React, { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import { useToast } from "@/app/_components/ui/use-toast";
import { authLogin } from "@/lib/auth/actions";

const LoginComponent = () => {
  const [isLoading] = useState<boolean>(false);
  const [adminId, setAdminId] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { toast } = useToast();

  const login = () => {
    authLogin(adminId, password)
      .then((result) => {
        if (result?.error != undefined) {
          toast({
            title: result.error,
            description: result.message,
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
              className="mb-3"
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
              className="mb-5"
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
