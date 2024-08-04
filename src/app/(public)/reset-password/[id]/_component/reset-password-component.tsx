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
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from "@/app/_components/ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z
  .object({
    adminId: z.string(),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(255, { message: "Password must be at most 255 characters long" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "Password must contain at least one special character",
      }),
    confirmPassword: z
      .string()
      .max(255, { message: "Password must be at most 255 characters long" }),
  })
  .refine((value) => value.confirmPassword === value.newPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const ResetPasswordComponent: React.FC<{
  user_id: string;
}> = ({ user_id }) => {
  const router = useRouter();
  // const [password, setPassword] = useState<string>("");
  // const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  // const [isSubmitEnabled, setIsSubmitEnabled] = useState<boolean>(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adminId: user_id,
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (values) => {
    setIsPending(true);
    resetPassword(values.adminId, values.newPassword)
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
  };

  return (
    <div className="mx-auto w-1/3 min-w-96">
      <div className="mb-4 rounded-xl bg-white px-8 pb-8 pt-6 shadow-lg">
        <h1 className="mb-4 text-2xl tracking-tight">Reset Password</h1>
        <Form {...form}>
          <div className="flex flex-col space-y-2">
            <FormField
              name="adminId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      disabled={true}
                      placeholder="XXXXXXX"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password Input */}
            <FormField
              name="newPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="mb-2 text-sm">
                    <div className="flex items-center justify-between">
                      <FormLabel className="flex-grow">New Password</FormLabel>
                      <div
                        className="ml-2 flex cursor-pointer items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </div>
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password"
                      autoCapitalize="none"
                      autoComplete="Password"
                      autoCorrect="off"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  {/* Validation Requirements */}
                  <div className="mt-2 space-y-1 text-sm">
                    <div
                      className={
                        field.value.length >= 8
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {field.value.length >= 8 ? "✓ " : "✗ "}At least 8
                      characters
                    </div>
                    <div
                      className={
                        /[A-Z]/.test(field.value)
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {/[A-Z]/.test(field.value) ? "✓ " : "✗ "}At least one
                      uppercase letter
                    </div>
                    <div
                      className={
                        /[a-z]/.test(field.value)
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {/[a-z]/.test(field.value) ? "✓ " : "✗ "}At least one
                      lowercase letter
                    </div>
                    <div
                      className={
                        /[0-9]/.test(field.value)
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {/[0-9]/.test(field.value) ? "✓ " : "✗ "}At least one
                      number
                    </div>
                    <div
                      className={
                        /[!@#$%^&*(),.?":{}|<>]/.test(field.value)
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {/[!@#$%^&*(),.?":{}|<>]/.test(field.value) ? "✓ " : "✗ "}
                      At least one special character
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {/* Confirm New Password Input */}
            <FormField
              name="confirmPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      autoCapitalize="none"
                      autoComplete="Password"
                      autoCorrect="off"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={!form.formState.isValid || isPending}
              className="mt-2"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </div>
        </Form>
        {/* <form
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
        </form> */}
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
