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
import { AccessRights } from "./AccessRightColumns";

interface DeleteAccessRightProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  accessRight: AccessRights | null;
  setAccessRghts: React.Dispatch<React.SetStateAction<AccessRights[]>>;
  staffId: string;
}

const DeleteAccessRight = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  accessRight,
  setAccessRghts,
  staffId,
}: DeleteAccessRightProps) => {
  const { toast } = useToast();

  const { mutate: deleteAccessRightFromStaff, isPending } =
    api.schoolAdmin.deleteAccessRightFromStaff.useMutation({
      onSuccess: () => {
        setAccessRghts((prev) =>
          prev.filter((item) => item.id !== accessRight?.id),
        );
        toast({
          title: "Access Right Deleted",
          description: "The access right has been deleted successfully",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting the access right",
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
              deleteAccessRightFromStaff({
                id: accessRight?.id!,
                staffId: staffId,
              });
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

export default DeleteAccessRight;
