"use client";

import React, { useCallback, useState } from "react";
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
import { Loader2, X, XCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "@/app/_components/ui/use-toast";
import { Course } from "./CoursesColumns";
import { type Equipment } from "@/app/_components/AddEquipmentColumns";
import AddEquipmentDialog from "./AddEquipmentDialog";
import { equipmentColumns } from "@/app/_components/EquipmentColumns";
import { EquipmentDataTable } from "@/app/_components/EquipmentDataTable";

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

  const { data: equipments } = api.courses.getEquipments.useQuery();

  const { toast } = useToast();
  const [selectedEquipments, setSelectedEquipments] = useState<Equipment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const { mutate: addCourse, isPending } = api.courses.addCourse.useMutation({
    onSuccess: (data) => {
      setCourses((prev) => [...prev, data]);
      toast({
        title: "Success",
        description: "Course added successfully",
      });
      form.reset();
      setSelectedEquipments([]);
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
  ) => {
    addCourse({
      name: values.name,
      code: values.code,
      equipments: selectedEquipments.map((equipment) => equipment.id),
    });
  };

  const onDelete = useCallback((selectedEquipment: Equipment) => {
    setSelectedEquipments((prev) =>
      prev.filter((equipment) => equipment.id !== selectedEquipment.id),
    );
  }, []);

  return (
    <div className="w-full">
      <AddEquipmentDialog
        equipments={equipments ?? []}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        setSeletedEquipments={setSelectedEquipments}
      />
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <p className="text-sm font-medium leading-none">
            Equipments Assigned to Course
          </p>
          {selectedEquipments.length > 0 && (
            <button
              onClick={() => {
                setSelectedEquipments([]);
              }}
              className="flex items-center text-sm font-medium leading-none text-red-500"
            >
              <XCircle className="mr-1 h-5 w-5" />
              Clear Selection
            </button>
          )}
        </div>
        <Button className="ml-auto" onClick={() => setIsDialogOpen(true)}>
          Assign Equipment
        </Button>
      </div>
      {selectedEquipments.length ? (
        <EquipmentDataTable
          columns={equipmentColumns({ onDelete })}
          data={selectedEquipments}
        />
      ) : (
        <div className="text-center">
          <X className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-600">
            No equipment selected for this course
          </p>
        </div>
      )}
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
    </div>
  );
};

export default AddCourse;
