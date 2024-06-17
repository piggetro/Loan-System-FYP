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
import { Equipment } from "./EquipmentColumns";
import { Textarea } from "@/app/_components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { Course } from "@/app/(protected)/school-admin/courses/_components/CoursesColumns";
import InventoryItemsForm, {
  InventoryItem,
} from "@/app/_components/InventoryItemsForm";

interface AddEquipmentProps {
  setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
  categories: Category[];
  courses: Course[];
}

export type Category = {
  id: string;
  name: string;
  subCategory: {
    id: string;
    name: string;
  }[];
};

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Course Name must be at least 1 character long" })
    .max(255, { message: "Course Name must be at most 255 characters long" }),
  checkList: z.string().optional(),
  category: z.string({ required_error: "Please select a category" }).min(1),
  subCategory: z
    .string({ required_error: "Please select a sub category" })
    .min(1),
  course: z.array(z.string()),
});

const AddEquipment = ({
  setEquipment,
  categories,
  courses,
}: AddEquipmentProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      checkList: "",
      category: "",
      subCategory: "",
      course: [],
    },
    mode: "onChange",
  });

  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [valid, setValid] = useState<boolean>(false);
  const [reset, setReset] = useState<boolean>(false);

  const { mutate: addEquipment, isPending } =
    api.equipment.addEquipment.useMutation({
      onSuccess: (data) => {
        setEquipment((prev) => [...prev, data]);
        toast({
          title: "Success",
          description: "Equipment added successfully",
        });
        form.reset();
        setInventoryItems([]);
        setReset(true);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while adding equipment",
          variant: "destructive",
        });
      },
    });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    addEquipment({
      ...values,
      inventoryItems: inventoryItems.map((item) => ({
        ...item,
        cost: parseFloat(item.cost),
      })),
    });
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <div className="mb-4 flex">
          {/* Left Column */}
          <div className="mr-4 flex-1 space-y-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Equipment Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue(field.name, value);
                      setSelectedCategory(value);
                      form.setValue("subCategory", "");
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Category</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue(field.name, value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Sub Category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(
                        (category) =>
                          (selectedCategory === category.id ||
                            !selectedCategory) &&
                          category.subCategory.map((subCategory) => (
                            <SelectItem
                              key={subCategory.id}
                              value={subCategory.id}
                            >
                              {subCategory.name}
                            </SelectItem>
                          )),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex-1 space-y-4">
            <FormField
              name="checkList"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Checklist</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Checklist (Optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="course"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">
                      Assign Equipment to Courses
                    </FormLabel>
                  </div>
                  {courses.map((course) => (
                    <FormField
                      key={course.id}
                      control={form.control}
                      name="course"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={course.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(course.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        course.id,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== course.id,
                                        ),
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {course.code} - {course.name}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>
      <div>
        <h3 className="mb-2 mt-7 text-lg font-semibold">
          Add Equipment to Inventory
        </h3>
        <InventoryItemsForm
          setInventoryItems={setInventoryItems}
          setValid={setValid}
          reset={reset}
          setReset={setReset}
        />
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

export default AddEquipment;
