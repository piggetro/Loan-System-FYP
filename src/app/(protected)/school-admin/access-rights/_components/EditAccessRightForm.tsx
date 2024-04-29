import React, { useEffect } from "react";
import { AccessRights } from "./Columns";
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

interface EditAccessRightFormProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (value: boolean) => void;
  accessRight: AccessRights | null;
  setAccessRights: React.Dispatch<React.SetStateAction<AccessRights[]>>;
}

const formSchema = z.object({
  pageName: z
    .string()
    .min(1, { message: "Page Name must be at least 1 character long" })
    .max(255, { message: "Page Name must be at most 255 characters long" }),
  pageLink: z
    .string()
    .min(1, { message: "Page Link must be at least 1 character long" })
    .max(255, { message: "Page Link must be at most 255 characters long" }),
});

const EditAccessRightForm = ({
  accessRight,
  isDialogOpen,
  setIsDialogOpen,
  setAccessRights,
}: EditAccessRightFormProps) => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pageName: accessRight?.pageName ?? "",
      pageLink: accessRight?.pageLink ?? "",
    },
    mode: "onChange",
  });

  const { mutate: updateAccessRight, isPending } =
    api.schoolAdmin.updateAccessRight.useMutation({
      onSuccess: (data) => {
        if (accessRight) {
          setAccessRights((prev) =>
            prev.map((item) =>
              item.id === accessRight.id ? { ...item, ...data } : item,
            ),
          );
          toast({
            title: "Access Right Updated",
            description: "The access right has been updated successfully",
          });
        }
        setIsDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while updating the access right",
          variant: "destructive",
        });
      },
    });

  useEffect(() => {
    if (accessRight) {
      form.reset({
        pageName: accessRight?.pageName,
        pageLink: accessRight?.pageLink,
      });
    } else {
      form.reset();
    }
  }, [isDialogOpen, accessRight]);

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    updateAccessRight({
      id: accessRight?.id ?? "",
      pageName: values.pageName,
      pageLink: values.pageLink,
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Access Right</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              name="pageName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Example Page" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="pageLink"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Link</FormLabel>
                  <FormControl>
                    <Input placeholder="/example/link" {...field} />
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

export default EditAccessRightForm;
