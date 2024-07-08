import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
  FormField,
} from "./ui/form";
import { Input } from "./ui/input";
import { CalendarIcon, PlusCircleIcon, XCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { Calendar } from "@/app/_components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "./ui/button";

export type InventoryItem = {
  assetNumber: string;
  cost: string;
  datePurchased: Date;
  warrantyExpiry: Date;
};

interface InventoryItemsFormProps {
  setInventoryItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  setValid: React.Dispatch<React.SetStateAction<boolean>>;
  reset?: boolean;
  setReset?: React.Dispatch<React.SetStateAction<boolean>>;
}

const assetSchema = z.object({
  assets: z.array(
    z.object({
      assetNumber: z.string().min(1, { message: "Asset Number is required" }),
      cost: z.string().regex(/^\d+(\.\d{2})?$/, {
        message: "Cost must be a valid number with exactly two decimal places",
      }),
      datePurchased: z.date({
        required_error: "Please select a date",
      }),
      warrantyExpiry: z.date({
        required_error: "Please select a date",
      }),
    }),
  ),
});

const InventoryItemsForm = ({
  setInventoryItems,
  setValid,
  reset,
  setReset,
}: InventoryItemsFormProps) => {
  const form = useForm<z.infer<typeof assetSchema>>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      assets: [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "assets",
  });

  const watchedFields = form.watch("assets");

  useEffect(() => {
    setInventoryItems(watchedFields);
    setValid(form.formState.isValid);
  }, [watchedFields, setInventoryItems, form.formState.isValid, setValid]);

  useEffect(() => {
    reset && form.reset();
    setReset && setReset(false);
  }, [reset]);

  return (
    <Form {...form}>
      {fields.map((field, index) => (
        <div key={field.id} className="mb-2 flex w-full space-x-2">
          <div className="flex-1">
            <FormField
              name={`assets.${index}.assetNumber`}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={`assetNumber-${index}`}>
                    Asset Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Asset Number"
                      id={`assetNumber-${index}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              name={`assets.${index}.cost`}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={`cost-${index}`}>Cost</FormLabel>
                  <FormControl>
                    <Input placeholder="0.00" id={`cost-${index}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name={`assets.${index}.datePurchased`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Purchased</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        captionLayout="dropdown-buttons"
                        fromYear={2005}
                        toYear={2040}
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex-1">
            <FormField
              control={form.control}
              name={`assets.${index}.warrantyExpiry`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warranty Expirary</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        captionLayout="dropdown-buttons"
                        fromYear={2005}
                        toYear={2040}
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex items-center">
            <div className="mt-8 flex h-full items-center justify-center">
              <button
                type="button"
                onClick={() => remove(index)}
                className="flex h-full items-center justify-center text-red-500"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          append({
            assetNumber: "",
            cost: "",
            datePurchased: new Date(),
            warrantyExpiry: new Date(),
          })
        }
        className="mt-4 flex w-full items-center justify-center rounded-sm border-2 border-dashed border-gray-400 px-4 py-2 text-gray-400"
      >
        <PlusCircleIcon className="h-6 w-6" />
      </button>
    </Form>
  );
};

export default InventoryItemsForm;
