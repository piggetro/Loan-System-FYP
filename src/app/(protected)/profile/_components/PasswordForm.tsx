import React from 'react';
import { useToast } from '@/app/_components/ui/use-toast';

import { Button } from "@/app/_components/ui/button";
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
import { Input } from "@/app/_components/ui/input";
import { Loader2 } from "lucide-react";
import { api } from "@/trpc/react";

// The back-end & input validation is by Franc. (Some of input validation was done by Jing Ru such as new password & confirm password comparison, but modified by Franc)

const formSchema = z
  .object({
    oldPassword: z
      .string(),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(255, { message: "Password must be at most 255 characters long" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(255, { message: "Password must be at most 255 characters long" }),
  })
  .refine((value) => value.confirmPassword === value.newPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
  .refine((value) => value.newPassword !== value.oldPassword,
    {
      message: "Password is the same as old password",
      path: ["newPassword"],
    });

const PasswordForm = () => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    },
    mode: "onChange",
  });

  const { mutate: changePassword, isPending } =
    api.profile.changePassword.useMutation({
      onSuccess: (data) => {
        console.log(data);
        if (data?.hashed_password) {
          toast({
            title: 'Password Changed Successfully',
            description: 'Your password has been updated.',
            variant: 'default',
          });
          form.reset({
            oldPassword: "", 
            newPassword: "", 
            confirmPassword: ""
          });
        } else {

          toast({
            title: "Password Change Failed",
            description: "Old password is incorrect",
            variant: "destructive",
          });

        }
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while updating your password.",
          variant: "destructive",
        });
      },
    });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    changePassword({
      oldPassword: values.oldPassword ?? "",
      newPassword: values.newPassword ?? "",
      confirmPassword: values.confirmPassword ?? "",
    });
  };

  {/* The front-end is Jing Ru's part, but slightly modified by Franc*/ }
  return (
    <div className="w-full">
      <Form {...form}>
        <div className="mb-4 flex space-x-4">
          {/* Left Column */}
          <div className="flex-1 space-y-4">
            {/* Old Password Input */}
            <FormField
              name="oldPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Old Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Old Password" {...field} />
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
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="New Password" {...field} />
                  </FormControl>
                  <FormMessage />
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
                    <Input type="password" placeholder="Confirm Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Buttons */}
            <div className="flex justify-end">
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={!form.formState.isValid || isPending}
                className="mt-2"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default PasswordForm;