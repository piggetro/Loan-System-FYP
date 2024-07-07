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
import { Holiday } from "./HolidayColumns";

interface DeleteHolidayProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  holiday: Holiday | null;
  setHolidays: React.Dispatch<React.SetStateAction<Holiday[]>>;
}

const DeleteHoliday = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  holiday,
  setHolidays,
}: DeleteHolidayProps) => {
  const { toast } = useToast();

  const { mutate: deleteHoliday, isPending } =
    api.semesterHoliday.deleteHoliday.useMutation({
      onSuccess: () => {
        setHolidays((prev) => prev.filter((item) => item.id !== holiday?.id));
        toast({
          title: "Holiday Deleted",
          description: "The holiday has been deleted successfully",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting the holiday",
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
              if (holiday?.id !== undefined) {
                deleteHoliday({ id: holiday.id });
              } else {
                console.error("No ID found for holiday");
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

export default DeleteHoliday;
