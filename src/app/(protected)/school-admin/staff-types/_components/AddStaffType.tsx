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
import { StaffTypes } from "./StaffTypeColumns";
import { useToast } from "@/app/_components/ui/use-toast";

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name must be at least 1 character long" })
    .max(255, { message: "Name must be at most 255 characters long" }),
});

interface AddStaffTypeProps {
  setStaffTypes: React.Dispatch<React.SetStateAction<StaffTypes[]>>;
}

const AddStaffType = ({ setStaffTypes }: AddStaffTypeProps) => {
  const { toast } = useToast();

  const { mutate: addStaffType, isPending } =
    api.staffTypes.addStaffType.useMutation({
      onSuccess: (data) => {
        setStaffTypes((prev) => [...prev, data]);
        toast({
          title: "Success",
          description: "Staff type added successfully",
        });
        form.reset();
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while adding staff type",
          variant: "destructive",
        });
      },
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    addStaffType(values);
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <form className="space-y-4">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Example" {...field} />
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

export default AddStaffType;
