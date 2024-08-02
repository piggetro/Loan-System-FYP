import React from "react";
import { useToast } from "@/app/_components/ui/use-toast";
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

const formSchema = z
  .object({
    oldPassword: z.string(),
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
  })
  .refine((value) => value.newPassword !== value.oldPassword, {
    message: "Password is the same as old password",
    path: ["newPassword"],
  });

const PasswordForm = () => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const { mutate: changePassword, isPending } =
    api.profile.changePassword.useMutation({
      onSuccess: (data) => {
        if (data) {
          toast({
            title: "Password Changed Successfully",
            description: "Your password has been updated.",
            variant: "default",
          });
          form.reset();
        } else {
          toast({
            title: "Password Change Failed",
            description: "Old password is incorrect",
            variant: "destructive",
          });
        }
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: "An error occurred while updating your password.",
          variant: "destructive",
        });
      },
    });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (values) => {
    changePassword(values);
  };

  const newPasswordErrors = form.formState.errors.newPassword;

  return (
    <div className="w-full">
      <Form {...form}>
        <div className="flex flex-col space-y-4">
          {/* Old Password Input */}
          <FormField
            name="oldPassword"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Old Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Old Password"
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
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="New Password"
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
                    {field.value.length >= 8 ? "✓ " : "✗ "}At least 8 characters
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
                    {/[0-9]/.test(field.value) ? "✓ " : "✗ "}At least one number
                  </div>
                  <div
                    className={
                      /[!@#$%^&*(),.?":{}|<>]/.test(field.value)
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {/[!@#$%^&*(),.?":{}|<>]/.test(field.value) ? "✓ " : "✗ "}At
                    least one special character
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
                    type="password"
                    placeholder="Confirm Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
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
      </Form>
    </div>
  );
};

export default PasswordForm;
