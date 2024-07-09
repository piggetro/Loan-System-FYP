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
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import { CalendarIcon, PlusCircleIcon, XCircle } from "lucide-react";
import { Button } from "@/app/_components/ui/button";

interface SubCategoryFormProps {
  setSubCategories: React.Dispatch<React.SetStateAction<{ name: string }[]>>;
  setValid: React.Dispatch<React.SetStateAction<boolean>>;
  reset?: boolean;
  setReset?: React.Dispatch<React.SetStateAction<boolean>>;
}

const assetSchema = z.object({
  assets: z.array(
    z.object({
      name: z.string().min(1, { message: "Sub Category is required" }),
    }),
  ),
});

const SubCategoryForm = ({
  setSubCategories,
  setValid,
  reset,
  setReset,
}: SubCategoryFormProps) => {
  const form = useForm<z.infer<typeof assetSchema>>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      assets: [
        {
          name: "",
        },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "assets",
  });

  const watchedFields = form.watch("assets");

  useEffect(() => {
    setSubCategories(watchedFields);
    setValid(form.formState.isValid);
  }, [watchedFields, setSubCategories, form.formState.isValid, setValid]);

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
              name={`assets.${index}.name`}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor={`name-${index}`}>Sub Category</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Sub Category"
                      id={`name-${index}`}
                      {...field}
                    />
                  </FormControl>
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
            name: "",
          })
        }
        className="mt-4 flex w-full items-center justify-center rounded-sm border-2 border-dashed border-gray-400 px-4 py-2 text-gray-400"
      >
        <PlusCircleIcon className="h-6 w-6" />
      </button>
    </Form>
  );
};

export default SubCategoryForm;
