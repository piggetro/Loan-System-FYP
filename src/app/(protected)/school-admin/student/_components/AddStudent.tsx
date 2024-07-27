import React, { useEffect, useState } from "react";
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
import { format, isValid, parse } from "date-fns";
import { Button } from "@/app/_components/ui/button";
import { type SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/app/_components/ui/input";
import { CalendarIcon, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "@/app/_components/ui/use-toast";
import type { Student } from "./StudentColumns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/app/_components/ui/calendar";
import Dropzone, { DropzoneState } from "shadcn-dropzone";
import Papa from "papaparse";

export type Course = {
  id: string;
  name: string;
  code: string;
};

export type Batch = {
  value: string;
};

interface AddStaffProps {
  setStudent: React.Dispatch<React.SetStateAction<Student[]>>;
  courses: Course[];
  batches: Batch[];
}

const formSchema = z.object({
  id: z
    .string()
    .min(1, { message: "Id must be at least 1 character long" })
    .max(255, { message: "Id must be at most 255 characters long" }),
  email: z.string().email({ message: "Invalid email" }),
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
});

const AddStaff = ({ setStudent, courses, batches }: AddStaffProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      email: "",
      name: "",
      course: "",
      batch: "",
    },
    mode: "onChange",
  });

  const { toast } = useToast();

  const { mutate: addStudent, isPending } =
    api.schoolAdmin.addStudent.useMutation({
      onSuccess: (data) => {
        setStudent((prev) => [...prev, data]);
        toast({
          title: "Success",
          description: "Student added successfully",
        });
        form.reset();
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while adding student",
          variant: "destructive",
        });
      },
    });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    addStudent(values);
  };

  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [bulkStudents, setBulkStudents] = useState<Student[]>([]);

  const onSelectedFileChange = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && acceptedFiles[0]) {
      setUploadedFileName(acceptedFiles[0].name);
      Papa.parse<Student>(acceptedFiles[0], {
        header: true,
        complete: (results) => {
          const data = results.data.map((item: Student) => {
            // Find course object by code and get the ID
            const course = courses.find((c) => c.code === item.course);
            const courseId = course ? course.id : null;

            const parsedDate = parse(
              String(item.graduationDate),
              "dd/MM/yyyy",
              new Date(),
            );
            const formattedDate = isValid(parsedDate)
              ? format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
              : null;
            return {
              ...item,
              course: courseId ?? "",
              graduationDate: formattedDate ?? new Date(),
            };
          });

          setBulkStudents(data);
        },
        skipEmptyLines: true,
      });
    }
  };

  const { mutate: bulkAddStudents, isPending: isAdding } =
    api.schoolAdmin.bulkAddStudents.useMutation({
      onSuccess: (data) => {
        setStudent((prev) => [...prev, ...data]);
        toast({
          title: "Success",
          description: "Student added successfully",
        });
        setBulkStudents([]);
        setUploadedFileName(null);        
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while adding student",
          variant: "destructive",
        });
      },
    });

  return (
    <div className="w-full">
      <Form {...form}>
        <div className="mb-4 flex">
          {/* Left Column */}
          <div className="mr-4 flex-1 space-y-4">
            {/* Added margin right for spacing between columns */}
            <FormField
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
                  <FormLabel className="mb-2">Graduation Date</FormLabel>
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
                        mode="single"
                        captionLayout="dropdown-buttons"
                        fromYear={2005}
                        toYear={2040}
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
      <div className="mt-2 flex flex-col">
        <Dropzone
          onDrop={onSelectedFileChange}
          multiple={false}
          accept={{
            "text/csv": [],
          }}
        >
          {(dropzone: DropzoneState) => (
            <div className="flex flex-col items-center justify-between p-4">
              {dropzone.isDragAccept ? (
                <div className="text-lg font-medium">Drop your file here!</div>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex flex-row items-center gap-0.5 text-lg font-medium">
                    Upload CSV file
                  </div>
                </div>
              )}
              <div
                className={`text-sm font-medium ${
                  uploadedFileName
                    ? "font-bold text-[#1c6c91]"
                    : "text-gray-400"
                }`}
              >
                {uploadedFileName ? (
                  <span>{uploadedFileName}</span>
                ) : (
                  `${dropzone.acceptedFiles.length} file uploaded so far.`
                )}
              </div>
            </div>
          )}
        </Dropzone>
        <div className="mt-2 self-end">
          <Button
            onClick={() => {
              bulkAddStudents(bulkStudents);
            }}
            disabled={!uploadedFileName || isAdding}
          >
            {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddStaff;
