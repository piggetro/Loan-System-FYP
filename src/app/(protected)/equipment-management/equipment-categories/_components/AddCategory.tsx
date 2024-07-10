"use client";

import React, { useState } from "react";
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
import { useToast } from "@/app/_components/ui/use-toast";
import { Category } from "./CategoriesColumns";
import SubCategoryForm from "../../equipment/_components/SubCategoryForm";

interface AddCategoryProps {
  setCategory: React.Dispatch<React.SetStateAction<Category[]>>;
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Category Name must be at least 1 character long" })
    .max(255, { message: "Category Name must be at most 255 characters long" }),
});

const AddCategory = ({ setCategory }: AddCategoryProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
    mode: "onChange",
  });

  const { toast } = useToast();
  const [subCategories, setSubCategories] = useState<{ name: string }[]>([]);
  const [valid, setValid] = useState<boolean>(false);
  const [reset, setReset] = useState<boolean>(false);

  const { mutate: addCategory, isPending } =
    api.equipment.addCategory.useMutation({
      onSuccess: (data) => {
        setCategory((prev) => [...prev, data]);
        toast({
          title: "Success",
          description: "Category added successfully",
        });
        form.reset();
        setSubCategories([]);
        setReset(true);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while adding category",
          variant: "destructive",
        });
      },
    });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    addCategory({
      ...values,
      subCategory: subCategories.map((sub) => sub.name),
    });
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="Category Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
      <div>
        <h3 className="mb-2 mt-7 text-lg font-semibold">
          Add Sub Category to Category
        </h3>
        <div className="w-full">
          <SubCategoryForm
            setSubCategories={setSubCategories}
            setValid={setValid}
            reset={reset}
            setReset={setReset}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!form.formState.isValid || !valid || isPending}
          onClick={form.handleSubmit(onSubmit)}
          className="mt-2"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default AddCategory;
