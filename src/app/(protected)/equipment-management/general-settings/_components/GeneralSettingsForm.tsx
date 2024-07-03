"use client";

import React, { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/app/_components/ui/input";
import { useToast } from "@/app/_components/ui/use-toast";
import { api } from "@/trpc/react";
import { Button } from "@/app/_components/ui/button";
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from "@/app/_components/ui/form";
import { Loader2 } from "lucide-react";

interface GeneralSettingsFormProps {
  generalSettings: {
    timeOfCollection: {
      start: string;
      end: string;
    };
    requestForCollection: {
      start: string;
      end: string;
    };
    voidLoan: {
      numberOfDays: number;
      timing: string;
    };
  };
}

const formSchema = z.object({
  startTimeOfCollection: z
    .string()
    .min(1, { message: "Start time of collection is required" }),
  endTimeOfCollection: z
    .string()
    .min(1, { message: "End time of collection is required" }),
  startRequestForCollection: z
    .string()
    .min(1, { message: "Start time for request of collection is required" }),
  endRequestForCollection: z
    .string()
    .min(1, { message: "Start time for request of collection is required" }),
  voidLoanNumberOfDays: z
    .string()
    .regex(/^\d+$/, { message: "Number is needed" }),
  voidLoanTiming: z.string().min(1, { message: "Void loan timing is needed" }),
});

const GeneralSettingsForm = ({ generalSettings }: GeneralSettingsFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startTimeOfCollection: generalSettings.timeOfCollection.start,
      endTimeOfCollection: generalSettings.timeOfCollection.end,
      startRequestForCollection: generalSettings.requestForCollection.start,
      endRequestForCollection: generalSettings.requestForCollection.end,
      voidLoanNumberOfDays: generalSettings.voidLoan.numberOfDays.toString(),
      voidLoanTiming: generalSettings.voidLoan.timing,
    },
    mode: "onChange",
  });
  const { toast } = useToast();

  const [disabled, setDisabled] = useState(true);

  const { mutate: updateGeneralSettings, isPending } =
    api.equipment.updateGeneralSettings.useMutation({
      onSuccess: (data) => {
        setDisabled(true);
        toast({
          title: "Success",
          description: "General settings updated successfully",
        });
        form.reset({
          ...data,
          voidLoanNumberOfDays: data.voidLoanNumberOfDays.toString(),
        });
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while updating general settings",
          variant: "destructive",
        });
      },
    });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    updateGeneralSettings({
      ...values,
      voidLoanNumberOfDays: parseInt(values?.voidLoanNumberOfDays ?? ""),
    });
  };

  return (
    <div className="mt-4 rounded-md bg-white px-6 py-4">
      <Form {...form}>
        <div className="mb-4 ">
          <div className="flex w-full space-x-4">
            <FormField
              disabled={disabled}
              name="startTimeOfCollection"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Start Time for Collection</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={disabled}
              name="endTimeOfCollection"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>End Time for Collection</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex w-full space-x-4">
            <FormField
              disabled={disabled}
              name="startRequestForCollection"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Start Time for Request for Collection</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={disabled}
              name="endRequestForCollection"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>End Time for Request for Collection</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex w-full space-x-4">
            <FormField
              disabled={disabled}
              name="voidLoanNumberOfDays"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Void Loan after a Number of Days</FormLabel>
                  <FormControl>
                    <Input placeholder="Number of Days" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={disabled}
              name="voidLoanTiming"
              control={form.control}
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Void Loan Timing</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {
            !disabled && form.reset();
            setDisabled(!disabled);
          }}
          className="mt-2"
        >
          {disabled ? "Edit" : "Cancel"}
        </Button>
        {!disabled && (
          <Button
            type="button"
            disabled={!form.formState.isValid || isPending}
            onClick={form.handleSubmit(onSubmit)}
            className="ms-2 mt-2"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        )}
      </div>
    </div>
  );
};

export default GeneralSettingsForm;
