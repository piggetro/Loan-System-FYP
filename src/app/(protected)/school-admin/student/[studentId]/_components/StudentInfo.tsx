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
import { format } from "date-fns";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/app/_components/ui/input";
import { Loader2, CalendarIcon } from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "@/app/_components/ui/use-toast";
import { Calendar } from "@/app/_components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { cn } from "@/lib/utils";
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

interface StudentInfoProps {
  student: Student;
  setStudent: React.Dispatch<React.SetStateAction<Student>>;
  courses: Course[];
  batches: Batch[];
}

export type Student = {
  id: string;
  email: string;
  name: string;
  mobile: string;
  course: string;
  batch: string;
  graduationDate: Date;
};

export type Course = {
  id: string;
  name: string;
  code: string;
};

export type Batch = {
  value: string;
};

const formSchema = z.object({
  id: z
    .string()
    .min(1, { message: "Id must be at least 1 character long" })
    .max(255, { message: "Id must be at most 255 characters long" }),
  email: z.string().email({ message: "Invalid email" }),
  mobile: z
    .string()
    .regex(/^\d{8}$/, { message: "Mobile number must be 8 digits long" })
    .optional()
    .or(z.literal("")),
  batch: z
    .string({
      required_error: "Please select a batch",
    })
    .min(1),
  name: z
    .string()
    .min(1, { message: "Name must be at least 1 character long" })
    .max(255, { message: "Name must be at most 255 characters long" }),
  course: z
    .string({
      required_error: "Please select a course",
    })
    .min(1),
  graduationDate: z.date({
    required_error: "A graduation date is required.",
  }),
  password: z.string().optional().or(z.literal("")),
});

const StudentInfo = ({
  student,
  setStudent,
  courses,
  batches,
}: StudentInfoProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: student.id,
      email: student.email,
      name: student.name,
      course: student.course,
      batch: student.batch,
      mobile: student.mobile,
      graduationDate: student.graduationDate,
      password: "",
    },
    mode: "onChange",
  });
  const { toast } = useToast();

  const [disabled, setDisabled] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const { mutate: updateStudent, isPending } =
    api.schoolAdmin.updateStudent.useMutation({
      onSuccess: (data) => {
        setStudent(data);
        setDisabled(true);
        toast({
          title: "Success",
          description: "Student updated successfully",
        });
        form.reset({
          ...data,
          password: "",
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
    updateStudent({
      ...values,
      id: student.id,
      newId: values.id,
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
              name="id"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Student ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={disabled}
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={disabled}
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@ichat.edu.sg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={disabled}
              name="mobile"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={disabled}
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Update Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Password" {...field} />
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
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Courses</FormLabel>
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
                        <SelectValue placeholder="Select a Course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
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
              name="batch"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch</FormLabel>
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
                        <SelectValue placeholder="Select Batch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.value} value={batch.value}>
                          {batch.value}
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
              name="graduationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Graduation Date</FormLabel>
                  <Popover>
                    <PopoverTrigger disabled={disabled} asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
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
        </div>
      </Form>
      <DeleteStudent
        {...{ isDeleteDialogOpen, setIsDeleteDialogOpen, student }}
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

export default StudentInfo;

interface DeleteStudentProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  student: Student | null;
}

const DeleteStudent = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  student,
}: DeleteStudentProps) => {
  const { toast } = useToast();

  const { mutate: deleteStudent, isPending: isDeleting } =
    api.schoolAdmin.deleteStudent.useMutation({
      onSuccess: () => {
        window.location.href = "/school-admin/student";
        toast({
          title: "Success",
          description: "Student deleted successfully",
        });
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting student",
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
            disabled={isDeleting}
            onClick={() => {
              if (student?.id) {
                deleteStudent({ id: student.id });
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
