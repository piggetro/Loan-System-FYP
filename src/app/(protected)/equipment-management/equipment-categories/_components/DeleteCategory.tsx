import React from "react";
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
import { useToast } from "@/app/_components/ui/use-toast";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { Category } from "./CategoriesColumns";

interface DeleteCategoryProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  category: Category | null;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const DeleteCategory = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  category,
  setCategories,
}: DeleteCategoryProps) => {
  const { toast } = useToast();

  const { mutate: deleteCategory, isPending } =
    api.equipment.deleteCategory.useMutation({
      onSuccess: () => {
        setCategories((prev) =>
          prev.filter((item) => item.id !== category?.id),
        );
        toast({
          title: "Category Deleted",
          description: "The category has been deleted successfully",
        });
        setIsDeleteDialogOpen(false);
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
            disabled={isPending || category?.id === undefined} // Disable if pending or id is undefined
            onClick={() => {
              if (category?.id !== undefined) {
                // Check for undefined before calling deleteCourse
                deleteCategory({ id: category.id });
              }
            }}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCategory;
