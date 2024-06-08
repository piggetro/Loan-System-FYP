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
import type { Course } from "./CoursesColumns";

interface DeleteCourseProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (value: boolean) => void;
  course: Course | null;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

const DeleteCourse = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  course,
  setCourses,
}: DeleteCourseProps) => {
  const { toast } = useToast();

  const { mutate: deleteCourse, isPending } =
    api.courses.deleteCourse.useMutation({
      onSuccess: () => {
        setCourses((prev) => prev.filter((item) => item.id !== course?.id));
        toast({
          title: "Course Deleted",
          description: "The course has been deleted successfully",
        });
        setIsDeleteDialogOpen(false);
      },
      onError: (err) => {
        console.log(err);
        toast({
          title: "Error",
          description: "An error occurred while deleting the course",
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
            disabled={isPending || course?.id === undefined} // Disable if pending or id is undefined
            onClick={() => {
              if (course?.id !== undefined) {
                // Check for undefined before calling deleteCourse
                deleteCourse({ id: course.id });
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

export default DeleteCourse;
