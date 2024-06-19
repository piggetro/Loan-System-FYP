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
import { StaffTypes } from "./StaffTypeColumns";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";

// In DeleteStaffType.tsx
interface DeleteStaffTypeProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  staffType: StaffTypes | null;
  setStaffTypes: React.Dispatch<React.SetStateAction<StaffTypes[]>>;
}

const DeleteStaffType = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  staffType,
  setStaffTypes,
}: DeleteStaffTypeProps) => {
  const { toast } = useToast();

  const { mutate: deleteStaffType, isPending } =
    api.staffTypes.deleteStaffType.useMutation({
      onSuccess: () => {
        setStaffTypes((prev) =>
          prev.filter((item) => item.id !== staffType?.id),
        );
        toast({
          title: "Staff Type Deleted",
          description: "The staff type has been deleted successfully",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting the staff type",
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
            data and remove the data from our servers.
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
              if (staffType?.id !== undefined) {
                deleteStaffType({ id: staffType.id });
              } else {
                console.error("No ID found for staffType");
              }
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

export default DeleteStaffType;
