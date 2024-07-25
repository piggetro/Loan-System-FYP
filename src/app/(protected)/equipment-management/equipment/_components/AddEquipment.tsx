"use client";

import React, { useEffect, useState } from "react";
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
import { FileType, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "@/app/_components/ui/use-toast";
import { Equipment } from "./EquipmentColumns";
import { Textarea } from "@/app/_components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { Course } from "@/app/(protected)/school-admin/courses/_components/CoursesColumns";
import InventoryItemsForm, {
  InventoryItem,
} from "@/app/_components/InventoryItemsForm";
import { Separator } from "@/app/_components/ui/separator";

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
    .min(1, { message: "Equipment Name must be at least 1 character long" })
    .max(255, {
      message: "Equipment Name must be at most 255 characters long",
    }),
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
  const [file, setFile] = useState<File | undefined>();
  const [fileType, setFileType] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    } else {
      setFile(undefined);
      setFileType(null);
      setImagePreview(null);
    }
  };

  const { mutate: addEquipment, isPending } =
    api.equipment.addEquipment.useMutation({
      onSuccess: async (data) => {
        try {
          if (!file) return;
          const formData = new FormData();
          formData.set("file", file);
          formData.set("photoPath", data.photoPath);

          const res = await fetch("/api/uploads", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error(await res.text());
        } catch (e) {
          console.error(e);
        } finally {
          setEquipment((prev) => [...prev, data]);
          toast({
            title: "Success",
            description: "Equipment added successfully",
          });
          form.reset();
          setInventoryItems([]);
          setSelectedCategory("");
          setReset(true);
          setFile(undefined);
          setFileType(null);
          setImagePreview(null);
        }
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

  useEffect(() => {
    console.log(fileType);
  }, [fileType]);

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    addEquipment({
      ...values,
      inventoryItems: inventoryItems.map((item) => ({
        ...item,
        cost: parseFloat(item.cost),
      })),
      photoType: fileType,
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
                            !selectedCategory) && (
                            <>
                              <SelectGroup key={category.name}>
                                <SelectLabel>{category.name}</SelectLabel>
                                {category.subCategory.map((subCategory) => (
                                  <SelectItem
                                    key={subCategory.id}
                                    value={subCategory.id}
                                  >
                                    {subCategory.name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                              <Separator className="h-0.5 bg-slate-500" />
                            </>
                          ),
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
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-0.5">
                  <label
                    htmlFor="file-upload"
                    className="block text-base font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Upload Equipment Image
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    name="file"
                    className="mt-2"
                    accept="image/jpeg, image/png, image/gif"
                    onChange={handleFileChange}
                  />
                </div>
                {imagePreview && (
                  <div className="flex-shrink-0">
                    <img
                      src={imagePreview}
                      alt="Selected File Preview"
                      className="h-20 w-20 border border-gray-300 object-cover"
                    />
                  </div>
                )}
                {file && (
                  <div className="mt-2">
                    <p>Selected file: {file.name}</p>
                    <p>File type: {fileType}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Form>
      <div>
        <h3 className="mb-2 mt-7 text-lg font-semibold">
          Add Equipment to Inventory
        </h3>
        <div className="w-3/4">
          <InventoryItemsForm
            setInventoryItems={setInventoryItems}
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

export default AddEquipment;
