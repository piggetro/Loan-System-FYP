import React, { useState } from "react";
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from "@/app/_components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Button } from "@/app/_components/ui/button";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/app/_components/ui/input";
import { Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "@/app/_components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/app/_components/ui/alert-dialog";
import { set } from "date-fns";

interface CourseInfoProps {
  course: Course;
  setCouse: React.Dispatch<React.SetStateAction<Course>>;
}

export type Course = {
  id: string;
  name: string;
  code: string;
  active: boolean;
};

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name must be at least 1 character long" }),
  code: z
    .string()
    .min(1, { message: "Code must be at least 1 character long" }),
  active: z.string({
    required_error: "Please select one of the options",
  }),
});

const CourseInfo = ({ course, setCouse }: CourseInfoProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: course.name,
      code: course.code,
      active: course.active ? "true" : "false",
    },
    mode: "onChange",
  });
  const { toast } = useToast();

  const [disabled, setDisabled] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const { mutate: updateCourse, isPending } =
    api.courses.updateCourse.useMutation({
      onSuccess: (data) => {
        setCouse(data);
        setDisabled(true);
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
        form.reset({
          ...data,
          active: data.active ? "true" : "false",
        });
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while updating student",
          variant: "destructive",
        });
      },
    });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    updateCourse({
      id: course.id,
      ...values,
      active: values.active === "true",
    });
  };

  return (
    <div className="w-full">
      <Form {...form}>
        <div className="mb-4 flex space-x-4">
          {/* Left Column */}
          <div className="flex-1 space-y-4">
            <FormField
              disabled={disabled}
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
              disabled={disabled}
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Course Code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Right Column */}
          <div className="flex-1 space-y-4">
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active/Inactive</FormLabel>
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
                        <SelectValue placeholder="Select one" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem key="true" value="true">
                        Active
                      </SelectItem>
                      <SelectItem key="false" value="false">
                        Inactive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>
      <DeleteCourse
        {...{ isDeleteDialogOpen, setIsDeleteDialogOpen, course }}
      />
      <div className="flex justify-end">
        <Button
          variant="destructive"
          className="me-2 mt-2"
          onClick={() => {
            setIsDeleteDialogOpen(true);
          }}
        >
          Delete
        </Button>
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

export default CourseInfo;

interface DeleteCourseProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  course: Course | null;
}

const DeleteCourse = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  course,
}: DeleteCourseProps) => {
  const { toast } = useToast();

  const { mutate: deleteCourse, isPending: isDeleting } =
    api.courses.deleteCourse.useMutation({
      onSuccess: () => {
        window.location.href = "/school-admin/courses";
        toast({
          title: "Success",
          description: "Course deleted successfully",
        });
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting course",
          variant: "destructive",
        });
      },
    });

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the data
            and remove the data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setIsDeleteDialogOpen(false);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isDeleting || course?.id === undefined} // Disable if pending or id is undefined
            onClick={() => {
              if (course?.id !== undefined) {
                // Check for undefined before calling deleteCourse
                deleteCourse({ id: course.id });
              }
            }}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
