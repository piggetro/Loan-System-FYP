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
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

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

  const { mutate: deleteAccessRight, isPending } =
    api.schoolAdmin.deleteAccessRight.useMutation({
      onSuccess: () => {
        setAccessRights((prev) =>
          prev.filter((item) => item.id !== accessRight?.id),
        );
        toast({
          title: "Access Right Updated",
          description: "The access right has been updated successfully",
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
              deleteAccessRight({ id: accessRight?.id! });
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
