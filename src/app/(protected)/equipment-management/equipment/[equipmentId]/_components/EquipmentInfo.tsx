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
import { Textarea } from "@/app/_components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { Category } from "../../_components/AddEquipment";
import { Course } from "@/app/(protected)/school-admin/courses/_components/CoursesColumns";

interface EquipmentInfoProps {
  equipment: Equipment;
  setEquipment: React.Dispatch<React.SetStateAction<Equipment>>;
  categories: Category[];
  courses: Course[];
}

export type Equipment = {
  id: string;
  name: string;
  checkList: string;
  courses: string[];
  category: string;
  subCategory: string;
  loanLimit: number;
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
  courses: z.array(z.string()),
  loanLimit: z
    .string()
    .regex(/^\d+$/, { message: "Loan Limit is needed, 0 means no limit" }),
});
const EquipmentInfo = ({
  equipment,
  setEquipment,
  categories,
  courses,
}: EquipmentInfoProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: equipment.name,
      checkList: equipment.checkList,
      category: equipment.category,
      subCategory: equipment.subCategory,
      courses: equipment.courses,
      loanLimit: equipment.loanLimit.toString(),
    },
    mode: "onChange",
  });

  const { toast } = useToast();
  const [disabled, setDisabled] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    equipment.category,
  );

  const { mutate: updateEquipment, isPending } =
    api.equipment.updateEquipment.useMutation({
      onSuccess: (data) => {
        setEquipment(data);
        setSelectedCategory(data.category);
        setDisabled(true);
        toast({
          title: "Success",
          description: "Equipment updated successfully",
        });
        form.reset({
          ...data,
          loanLimit: data.loanLimit.toString(),
        });
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while updating equipment",
          variant: "destructive",
        });
      },
    });

  const { mutate: deleteEquipment, isPending: isDeleting } =
    api.equipment.deleteEquipment.useMutation({
      onSuccess: () => {
        window.location.href = "/equipment-management/equipment";
        toast({
          title: "Equipment Deleted",
          description: "The equipment has been deleted successfully",
        });
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting the equipment",
          variant: "destructive",
        });
      },
    });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    updateEquipment({
      id: equipment.id,
      ...values,
      loanLimit: parseInt(values?.loanLimit ?? ""),
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
              disabled={disabled}
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
                    disabled={disabled}
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
              disabled={disabled}
              control={form.control}
              name="subCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Category</FormLabel>
                  <Select
                    disabled={disabled}
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
            <FormField
              name="loanLimit"
              disabled={disabled}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limit Per Loan</FormLabel>
                  <FormControl>
                    <Input placeholder="0 - 99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex-1 space-y-4">
            <FormField
              disabled={disabled}
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
              name="courses"
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
                      name="courses"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={course.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                disabled={disabled}
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
      <div className="flex justify-end">
        <Button
          variant="destructive"
          className="me-2 mt-2"
          disabled={isDeleting}
          onClick={() => {
            deleteEquipment({ id: equipment.id });
          }}
        >
          {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Delete
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (!disabled) {
              form.reset();
              setSelectedCategory(equipment.category);
            }
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

export default EquipmentInfo;
