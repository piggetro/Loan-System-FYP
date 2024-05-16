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
import type { Student } from "./StudentColumns";

interface DeleteStudentProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  student: Student | null;
  setStudent: React.Dispatch<React.SetStateAction<Student[]>>;
}

const DeleteStudent = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  student,
  setStudent,
}: DeleteStudentProps) => {
  const { toast } = useToast();

  const { mutate: deleteStudent, isPending } =
    api.schoolAdmin.deleteStudent.useMutation({
      onSuccess: () => {
        setStudent((prev) => prev.filter((item) => item.id !== student?.id));
        toast({
          title: "Student Deleted",
          description: "The student has been deleted successfully",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting the student",
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
              if (student?.id) {
                deleteStudent({ id: student.id });
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

export default DeleteStudent;
