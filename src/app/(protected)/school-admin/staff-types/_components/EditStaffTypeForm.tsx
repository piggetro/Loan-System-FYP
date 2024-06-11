import React, { useEffect } from "react";
import { StaffTypes } from "./StaffTypeColumns";
import { useToast } from "@/app/_components/ui/use-toast";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from "@/app/_components/ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/app/_components/ui/input";
import { Loader2 } from "lucide-react";
import { api } from "@/trpc/react";

interface EditStaffTypeFormProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  staffType: StaffTypes | null;
  setStaffTypes: React.Dispatch<React.SetStateAction<StaffTypes[]>>;
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name must be at least 1 character long" })
    .max(255, { message: "Name must be at most 255 characters long" }),
});

const EditStaffTypeForm = ({
  staffType,
  isDialogOpen,
  setIsDialogOpen,
  setStaffTypes,
}: EditStaffTypeFormProps) => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: staffType?.name ?? "",
    },
    mode: "onChange",
  });

  const { mutate: updateStaffType, isPending } =
    api.staffTypes.updateStaffType.useMutation({
      onSuccess: (data) => {
        if (staffType) {
          setStaffTypes((prev) =>
            prev.map((item) =>
              item.id === staffType.id ? { ...item, ...data } : item,
            ),
          );
          toast({
            title: "Staff Type Updated",
            description: "The staff type has been updated successfully",
          });
        }
        setIsDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while updating the staff type",
          variant: "destructive",
        });
      },
    });

  useEffect(() => {
    if (staffType) {
      form.reset({
        name: staffType?.name,
      });
    } else {
      form.reset();
    }
  }, [isDialogOpen, staffType]);

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    updateStaffType({
      id: staffType?.id ?? "",
      name: values.name,
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Staff Type</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Example" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

export default EditStaffTypeForm;
