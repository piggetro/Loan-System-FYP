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
import { Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "@/app/_components/ui/use-toast";
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

export type Role = {
  id: string;
  role: string;
};

interface RoleInfoProps {
  role: Role;
  setRole: React.Dispatch<React.SetStateAction<Role>>;
}

const formSchema = z.object({
  role: z.string().min(1, "Role name is required"),
});

const RoleInfo = ({ role, setRole }: RoleInfoProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: role.role,
    },
    mode: "onChange",
  });

  const { toast } = useToast();

  const [disabled, setDisabled] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const { mutate: updateRoleDetails, isPending } =
    api.schoolAdmin.updateRoleDetails.useMutation({
      onSuccess: () => {
        setRole({ id: role.id, role: form.getValues().role });
        toast({
          title: "Success",
          description: "Role details updated successfully",
        });
        setDisabled(true);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while updating role details",
          variant: "destructive",
        });
      },
    });

  const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = (
    values: z.infer<typeof formSchema>,
  ) => {
    updateRoleDetails({ id: role.id, role: values.role });
  };
  return (
    <div className="w-full">
      <Form {...form}>
        <div className="mb-4 flex space-x-4">
          <div className="w-1/2">
            <FormField
              disabled={disabled}
              name="role"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input placeholder="Role Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Form>
      <DeleteRole
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        role={role}
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
            !disabled && form.reset();
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

export default RoleInfo;

interface DeleteRoleProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  role: Role | null;
}

const DeleteRole = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  role,
}: DeleteRoleProps) => {
  const { toast } = useToast();

  const { mutate: deleteRole, isPending: isDeleting } =
    api.schoolAdmin.deleteRole.useMutation({
      onSuccess: () => {
        window.location.href = "/school-admin/roles";
        toast({
          title: "Success",
          description: "Role deleted successfully",
        });
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting role",
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
            disabled={isDeleting || role?.id === undefined} // Disable if pending or id is undefined
            onClick={() => {
              if (role?.id !== undefined) {
                // Check for undefined before calling deleteRole
                deleteRole({ id: role.id });
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
