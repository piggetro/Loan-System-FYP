"use client";

import React, { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import { useToast } from "@/app/_components/ui/use-toast";
import { signIn } from "next-auth/react";
import { api } from "@/trpc/react";

const LoginComponent = () => {
  const [isLoading] = useState<boolean>(false);
  const [adminId, setAdminId] = useState<string>("");

  const [signedIn, setSignedIn] = useState<boolean>(false);
  const getEmailByAdminId = api.user.getEmailByAdminId.useMutation();

  const { toast } = useToast();

  const login = () => {
    getEmailByAdminId
      .mutateAsync({ adminId: adminId })
      .then((results) => {
        if (results != null) {
          signIn("email", {
            email: results.email,
            redirect: false,
          })
            .then((data) => {
              if (data?.error === null) {
                toast({
                  title: "Check Email Inbox",
                  description:
                    "If your sign in is valid, you will receive a Sign In Link",
                });
                setAdminId("");
              }
              if (data?.error === "AccessDenied") {
                setSignedIn(false);
              }
            })
            .catch((error) => {
              console.log(error);
              setSignedIn(false);
            });
        }
      })
      .catch((error) => {
        console.log("error", error);
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
          </div>
          <div className="mb-5">
            <span className=" text-xs opacity-50">Omit P for Admin ID</span>
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
