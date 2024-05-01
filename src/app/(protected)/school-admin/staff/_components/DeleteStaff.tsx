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
import { Staff } from "./StaffColumns";

interface DeleteStaffProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  staff: Staff | null;
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
}

const DeleteStaff = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  staff,
  setStaff,
}: DeleteStaffProps) => {
  const { toast } = useToast();

  const { mutate: deleteStaff, isPending } =
    api.schoolAdmin.deleteStaff.useMutation({
      onSuccess: () => {
        setStaff((prev) => prev.filter((item) => item.id !== staff?.id));
        toast({
          title: "Staff Deleted",
          description: "The staff has been deleted successfully",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting the staff",
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
                deleteStaff({ id: staff?.id! });
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

export default DeleteStaff;
