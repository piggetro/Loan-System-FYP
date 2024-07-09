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
import { SubCategory } from "./SubCategoryColumns";

interface DeleteSubCategoryProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  subCategory: SubCategory | null;
  setSubCategories: React.Dispatch<React.SetStateAction<SubCategory[]>>;
}

const DeleteSubCategory = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  subCategory,
  setSubCategories,
}: DeleteSubCategoryProps) => {
  const { toast } = useToast();

  const { mutate: deleteSubCategory, isPending } =
    api.equipment.deleteSubCategory.useMutation({
      onSuccess: () => {
        setSubCategories((prev) =>
          prev.filter((item) => item.id !== subCategory?.id),
        );
        toast({
          title: "Sub Category Deleted",
          description: "The sub category has been deleted successfully",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting the sub category",
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
            disabled={isPending}
            onClick={() => {
              if (subCategory?.id) {
                deleteSubCategory({
                  id: subCategory.id,
                });
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

export default DeleteSubCategory;
