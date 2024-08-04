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
import { Delete, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "@/app/_components/ui/use-toast";
import { Category } from "../../_components/CategoriesColumns";
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

interface CategoryProps {
  category: Category;
  setCategory: React.Dispatch<React.SetStateAction<Category>>;
}
const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Category must be at least 1 character long" })
    .max(255, { message: "Category must be at most 255 characters long" }),
});
const CategoryInfo = ({ category, setCategory }: CategoryProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category.name,
    },
    mode: "onChange",
  });

  const { toast } = useToast();
  const [disabled, setDisabled] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const { mutate: updateCategory, isPending } =
    api.equipment.updateCategory.useMutation({
      onSuccess: (data) => {
        setCategory(data);
        setDisabled(true);
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
        form.reset(data);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while updating category",
          variant: "destructive",
        });
      },
    });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    updateCategory({
      id: category.id,
      ...values,
    });
  };

  return (
    <div className="w-full">
      <Form {...form}>
        {/* Left Column */}
        <div className="space-y-4">
          <FormField
            name="name"
            disabled={disabled}
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
      <DeleteCategory
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        category={category}
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
            if (!disabled) {
              form.reset();
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

export default CategoryInfo;

interface DeleteCategoryProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  category: Category | null;
}

const DeleteCategory = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  category,
}: DeleteCategoryProps) => {
  const { toast } = useToast();

  const { mutate: deleteCategory, isPending: isDeleting } =
    api.equipment.deleteCategory.useMutation({
      onSuccess: () => {
        window.location.href = "/equipment-management/equipment-categories";
        toast({
          title: "Category Deleted",
          description: "The category has been deleted successfully",
        });
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting the category",
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
            disabled={isDeleting || category?.id === undefined} // Disable if pending or id is undefined
            onClick={() => {
              if (category?.id !== undefined) {
                // Check for undefined before calling deleteCourse
                deleteCategory({ id: category.id });
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
