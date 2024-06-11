import React, { useEffect } from "react";
import { OrganizationUnits } from "./OrganizationUnitColumns";
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

interface EditOrganizationUnitFormProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  organizationUnit: OrganizationUnits | null;
  setOrganizationUnits: React.Dispatch<React.SetStateAction<OrganizationUnits[]>>;
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name must be at least 1 character long" })
    .max(255, { message: "Name must be at most 255 characters long" }),
});

const EditOrganizationUnitForm = ({
  organizationUnit,
  isDialogOpen,
  setIsDialogOpen,
  setOrganizationUnits,
}: EditOrganizationUnitFormProps) => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: organizationUnit?.name ?? "",
    },
    mode: "onChange",
  });

  const { mutate: updateOrganizationUnit, isPending } =
    api.organisationUnits.updateOrganizationUnit.useMutation({
      onSuccess: (data) => {
        if (organizationUnit) {
          setOrganizationUnits((prev) =>
            prev.map((item) =>
              item.id === organizationUnit.id ? { ...item, ...data } : item,
            ),
          );
          toast({
            title: "Organization Unit Updated",
            description: "The organization unit has been updated successfully",
          });
        }
        setIsDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while updating the organization unit",
          variant: "destructive",
        });
      },
    });

  useEffect(() => {
    if (organizationUnit) {
      form.reset({
        name: organizationUnit?.name,
      });
    } else {
      form.reset();
    }
  }, [isDialogOpen, organizationUnit]);

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    updateOrganizationUnit({
      id: organizationUnit?.id ?? "",
      name: values.name,
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Organization Unit</DialogTitle>
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

export default EditOrganizationUnitForm;
