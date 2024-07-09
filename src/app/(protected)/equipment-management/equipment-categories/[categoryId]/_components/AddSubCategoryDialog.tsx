"use client";

import React, { useState } from "react";
import { useToast } from "@/app/_components/ui/use-toast";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { SubCategory } from "./SubCategoryColumns";
import SubCategoryForm from "../../../equipment/_components/SubCategoryForm";

interface AddSubCategoryDialogProps {
  setSubCategories: React.Dispatch<React.SetStateAction<SubCategory[]>>;
  isDialogOpen: boolean;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  categoryId: string;
}

const AddSubCategoryDialog = ({
  setSubCategories: setSubCat,
  isDialogOpen,
  setIsDialogOpen,
  categoryId,
}: AddSubCategoryDialogProps) => {
  const { toast } = useToast();

  const [subCategories, setSubCategories] = useState<{ name: string }[]>([]);
  const [valid, setValid] = useState<boolean>(false);

  const { mutate: addSubCategory, isPending } =
    api.equipment.addSubCategory.useMutation({
      onSuccess: (data) => {
        setSubCat((prev) => [...prev, ...data]);
        toast({
          title: "Success",
          description: "Sub categories added to category successfully",
        });
        setIsDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description:
            "An error occurred while adding sub categories to category",
          variant: "destructive",
        });
      },
    });

  const onSubmit = () => {
    addSubCategory({
      id: categoryId,
      name: subCategories.map((subCategory) => subCategory.name),
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle> Add Sub Categories to Category</DialogTitle>
        </DialogHeader>
        <div>
          <SubCategoryForm
            setSubCategories={setSubCategories}
            setValid={setValid}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={!valid || subCategories.length === 0 || isPending}
            onClick={onSubmit}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubCategoryDialog;
