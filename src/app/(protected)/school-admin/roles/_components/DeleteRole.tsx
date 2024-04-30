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
import { type Roles } from "./RolesColumns";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

interface DeleteRoleProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  role: Roles | null;
  setRoles: React.Dispatch<React.SetStateAction<Roles[]>>;
}

const DeleteRole = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  role,
  setRoles,
}: DeleteRoleProps) => {
  const { toast } = useToast();

  const { mutate: deleteRole, isPending } =
    api.schoolAdmin.deleteRole.useMutation({
      onSuccess: () => {
        setRoles((prev) => prev.filter((item) => item.id !== role?.id));
        toast({
          title: "Role Deleted",
          description: "The role has been deleted successfully",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting the role",
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
            This action cannot be undone. This will permanently delete the
            access right and remove the data from our servers.
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
              deleteRole({ id: role?.id! });
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

export default DeleteRole;
