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
import { AccessRights } from "./Columns";

// In DeleteAccessRight.tsx
interface DeleteAccessRightProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  accessRight: AccessRights | null;
  setAccessRights: React.Dispatch<React.SetStateAction<AccessRights[]>>;
}

const DeleteAccessRight = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  accessRight,
  setAccessRights,
}: DeleteAccessRightProps) => {
  const { toast } = useToast();

  const onConfirmDelete = () => {
    if (accessRight) {
      setAccessRights((prev) =>
        prev.filter((item) => item.id !== accessRight.id),
      );
      setIsDeleteDialogOpen(false);
      toast({
        title: "Access Right Deleted",
        description: "The access right has been deleted successfully",
      });
    }
  };

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
          <AlertDialogAction onClick={onConfirmDelete}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccessRight;
