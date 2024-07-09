import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { z } from "zod";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
  FormField,
} from "@/app/_components/ui/form";
import { Input } from "@/app/_components/ui/input";
import { Loader2 } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import { toast } from "@/app/_components/ui/use-toast";
import { api } from "@/trpc/react";
import { SubCategory } from "./SubCategoryColumns";

interface EditSubCategoryProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  subCategory: SubCategory | null;
  setSubCategories: React.Dispatch<React.SetStateAction<SubCategory[]>>;
}

const assetSchema = z.object({
  name: z.string().min(1, { message: "Sub Category is required" }),
});

const EditSubCategory = ({
  subCategory,
  isDialogOpen,
  setIsDialogOpen,
  setSubCategories,
}: EditSubCategoryProps) => {
  const form = useForm<z.infer<typeof assetSchema>>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: subCategory?.name ?? "",
    },
    mode: "onChange",
  });

  const { mutate: updateSubCategory, isPending } =
    api.equipment.updateSubCategory.useMutation({
      onSuccess: (data) => {
        if (subCategory) {
          setSubCategories((prev) =>
            prev.map((item) =>
              item.id === subCategory.id ? { ...item, ...data } : item,
            ),
          );
          toast({
            title: "Sub Category Updated",
            description: "The sub category has been updated successfully",
          });
        }
        setIsDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while updating the sub category",
          variant: "destructive",
        });
      },
    });

  useEffect(() => {
    if (subCategory) {
      form.reset({
        name: subCategory.name,
      });
    } else {
      form.reset();
    }
  }, [isDialogOpen, subCategory]);

  const onSubmit: SubmitHandler<z.infer<typeof assetSchema>> = (
    values: z.infer<typeof assetSchema>,
  ) => {
    updateSubCategory({
      id: subCategory?.id ?? "",
      ...values,
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Sub Category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4">
            <div className="flex-1">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Sub Category" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="button"
            disabled={!form.formState.isValid || isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubCategory;
