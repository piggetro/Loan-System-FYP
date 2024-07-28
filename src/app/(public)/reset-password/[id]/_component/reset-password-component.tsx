/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { Label } from "@/app/_components/ui/label";
import { Input } from "@/app/_components/ui/input";
import { useToast } from "@/app/_components/ui/use-toast";
import { resetPassword } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const ResetPasswordComponent: React.FC<{
  user_id: string;
}> = ({ user_id }) => {
  const router = useRouter();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    if (password === confirmPassword && password !== "") {
      setIsSubmitEnabled(true);
    }
  }, [password, confirmPassword]);

  const performLogin = () => {
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please try again",
        variant: "destructive",
      });
    } else {
      setIsPending(true);
      resetPassword(user_id, password)
        .then((result) => {
          if (result.success) {
            setTimeout(() => {
              router.push("/login");
            }, 2000);
          }
          toast({
            title: result.title,
            description: result.description,
            variant: result.success ? "default" : "destructive",
          });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  return (
    <div className="mx-auto w-1/3 min-w-96">
      <div className="mb-4 rounded-xl bg-white px-8 pb-8 pt-6 shadow-lg">
        <h1 className="mb-4 text-2xl tracking-tight">Reset Password</h1>

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
              User ID
            </Label>
            <Input
              value={user_id}
              id="adminId"
              placeholder="XXXXXXX"
              minLength={1}
              type="text"
              autoCapitalize="none"
              autoComplete="User Number"
              autoCorrect="off"
              disabled={true}
              className="mb-4"
            />

            <div className="mb-2 flex items-center text-sm">
              <Label
                className="block w-1/2 font-bold text-gray-700"
                htmlFor="email"
              >
                New Password
              </Label>
              <div
                className="flex w-1/2 items-center justify-end font-medium hover:cursor-pointer"
                onClick={() => {
                  setShowPassword(!showPassword);
                }}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
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
              disabled={isPending}
              className="mb-5"
            />
            <div className="mb-2 flex items-center text-sm">
              <Label
                className="block w-1/2 font-bold text-gray-700"
                htmlFor="email"
              >
                Confirm Password
              </Label>
            </div>
            <Input
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
              id="password"
              placeholder="Password Input"
              minLength={1}
              type={showPassword ? "text" : "password"}
              autoCapitalize="none"
              autoComplete="Password"
              autoCorrect="off"
              disabled={isPending}
              className="mb-5"
            />
          </div>

          <Button
            disabled={isPending || !isSubmitEnabled}
            className="mb-3 w-full"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
        <span className="mt-2 flex text-sm font-medium">
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
