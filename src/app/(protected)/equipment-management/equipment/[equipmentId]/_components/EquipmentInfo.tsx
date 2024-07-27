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
import { Loader2, XCircle } from "lucide-react";
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
import { Label } from "@/app/_components/ui/label";

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
  photoPath: string;
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
  const [file, setFile] = useState<File | undefined>();
  const [fileType, setFileType] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deletePhoto, setDeletePhoto] = useState<boolean>(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? undefined;

    if (selectedFile) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];

      if (!validImageTypes.includes(selectedFile.type)) {
        alert("Please select a valid image file (JPG, PNG, GIF).");
        setFile(undefined);
        setFileType(null);
        setImagePreview(null);
        return;
      }

      setFile(selectedFile);

      const previewUrl = URL.createObjectURL(selectedFile);
      setImagePreview(previewUrl);

      const mimeTypeToExtension: Record<string, string> = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/gif": ".gif",
      };

      const fileExtension = mimeTypeToExtension[selectedFile.type] ?? "unknown";
      setFileType(fileExtension);
      setDeletePhoto(false);
      await form.trigger();
    } else {
      setFile(undefined);
      setFileType(null);
      setImagePreview(null);
    }
  };

  const { mutate: updateEquipment, isPending } =
    api.equipment.updateEquipment.useMutation({
      onSuccess: async (data) => {
        try {
          if (equipment.photoPath === data.photoPath) return;
          const formData = new FormData();
          file && formData.set("file", file);
          formData.set("oldPath", equipment.photoPath);
          formData.set("newPath", data.photoPath);

          const res = await fetch("/api/uploads/update", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error(await res.text());
        } catch (e) {
          console.error(e);
        } finally {
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
          setFile(undefined);
          setFileType(null);
          setImagePreview(null);
          setDeletePhoto(false);
        }
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
      photoType:
        !deletePhoto && !fileType
          ? null
          : deletePhoto
            ? "default.jpg"
            : fileType,
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
            <div className="space-y-4">
              <div className="flex items-start space-x-10 ">
                <div className="flex-1/2">
                  <Label htmlFor="file-upload">Upload Equipment Image</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    name="file"
                    className={`mt-2 ${!disabled && "cursor-pointer"}`}
                    accept="image/jpeg, image/png, image/gif"
                    onChange={handleFileChange}
                    disabled={disabled}
                    style={{ color: "transparent" }}
                  />
                </div>
                {equipment.photoPath && (
                  <div className="relative">
                    <div className="flex-shrink-0">
                      <img
                        src={
                          imagePreview
                            ? imagePreview
                            : deletePhoto
                              ? "/api/uploads/default.jpg"
                              : "/api/uploads/" + equipment.photoPath
                        }
                        alt="Selected File Preview"
                        className="h-40 w-40 border border-gray-300 object-cover"
                      />
                      <div
                        className={`absolute right-0 top-0 mr-1 mt-1 cursor-pointer ${disabled && "hidden"}`}
                        onClick={async () => {
                          setDeletePhoto(true);
                          setFile(undefined);
                          setFileType(null);
                          setImagePreview(null);
                          await form.trigger();
                        }}
                      >
                        <XCircle className="h-6 w-6 text-red-500" />
                      </div>
                    </div>
                  </div>
                )}
                {file && (
                  <div className="ms-4 mt-2">
                    <p>Selected file: {file.name}</p>
                    <p>File type: {fileType}</p>
                  </div>
                )}
              </div>
            </div>
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
              setImagePreview(null);
              setFile(undefined);
              setFileType(null);
              setDeletePhoto(false);
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
