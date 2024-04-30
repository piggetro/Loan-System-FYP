"use client";

import React from "react";
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from "@/app/_components/ui/form";
import { Button } from "@/app/_components/ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/app/_components/ui/input";
import { Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { AccessRights } from "./Columns";
import { useToast } from "@/app/_components/ui/use-toast";

const formSchema = z.object({
  pageName: z
    .string()
    .min(1, { message: "Page Name must be at least 1 character long" })
    .max(255, { message: "Page Name must be at most 255 characters long" }),
  pageLink: z
    .string()
    .min(1, { message: "Page Link must be at least 1 character long" })
    .max(255, { message: "Page Link must be at most 255 characters long" }),
});

interface AddAccessRightProps {
  setAccessRights: React.Dispatch<React.SetStateAction<AccessRights[]>>;
}

const AddAccessRight = ({ setAccessRights }: AddAccessRightProps) => {
  const { toast } = useToast();

  const { mutate: addAccessRight, isPending } =
    api.schoolAdmin.addAccessRight.useMutation({
      onSuccess: (data) => {
        setAccessRights((prev) => [...prev, data]);
        toast({
          title: "Success",
          description: "Access right added successfully",
        });
        form.reset();
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while adding access right",
          variant: "destructive",
        });
      },
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pageName: "",
      pageLink: "",
    },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    addAccessRight(values);
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            name="pageName"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Page Name</FormLabel>
                <FormControl>
                  <Input placeholder="Example Page" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="pageLink"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Page Link</FormLabel>
                <FormControl>
                  <Input placeholder="/example/link" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Additional div for button placement */}
          <div className="flex justify-end">
            <Button
              type="button"
              disabled={!form.formState.isValid || isPending}
              onClick={form.handleSubmit(onSubmit)}
              className="mt-2"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddAccessRight;
