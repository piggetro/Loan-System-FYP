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
import { Semester } from "./SemesterColumns";

interface DeleteSemesterProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  semester: Semester | null;
  setSemesters: React.Dispatch<React.SetStateAction<Semester[]>>;
}

const DeleteSemester = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  semester,
  setSemesters,
}: DeleteSemesterProps) => {
  const { toast } = useToast();

  const { mutate: deleteSemester, isPending } =
    api.semesterHoliday.deleteSemester.useMutation({
      onSuccess: () => {
        setSemesters((prev) => prev.filter((item) => item.id !== semester?.id));
        toast({
          title: "Semester Deleted",
          description: "The semester has been deleted successfully",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting the semester",
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
              if (semester?.id !== undefined) {
                deleteSemester({ id: semester.id });
              } else {
                console.error("No ID found for semester");
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

export default DeleteSemester;
