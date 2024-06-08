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
import { Course } from "./CoursesColumns";
import { Equipment } from "@/app/_components/AddEquipmentColumns";

interface AddCourseProps {
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Course Name must be at least 1 character long" })
    .max(255, { message: "Course Name must be at most 255 characters long" }),
  code: z
    .string()
    .min(1, { message: "Course Code must be at least 1 character long" })
    .max(255, { message: "Course Code must be at most 255 characters long" }),
});

const AddCourse = ({ setCourses }: AddCourseProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      code: "",
    },
    mode: "onChange",
  });

  const { toast } = useToast();
  const [selectedEquipments, setSelectedEquipments] = useState<Equipment[]>([]);

  const { mutate: addCourse, isPending } = api.courses.addCourse.useMutation({
    onSuccess: (data) => {
      setCourses((prev) => [...prev, data]);
      toast({
        title: "Success",
        description: "Course added successfully",
      });
      form.reset();
      //unselect table
    },
    onError: (err) => {
      console.log(err);
      toast({
        title: "Error",
        description: "An error occurred while adding course",
        variant: "destructive",
      });
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {};

  return (
    <div className="w-full">
      <Form {...form}>
        <form className="mb-4 space-y-4">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input placeholder="Course Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="code"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input placeholder="DIT" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <p className="mb-4 text-sm font-medium leading-none">
        Assign Equipments to Course
      </p>
      <AccessRightDataTable
        columns={accessRightColumns()}
        data={accessRights}
        setSelectedAccessRights={setSelectedAccessRights}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          disabled={
            !form.formState.isValid || isPending || !selectedEquipments.length
          }
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

export default AddCourse;
