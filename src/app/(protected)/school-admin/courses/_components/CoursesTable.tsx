import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { courseColumns, type Course } from "./CoursesColumns";
import { CoursesDataTable } from "./CoursesDataTable";
import DeleteCourse from "./DeleteCourse";

interface CoursesTableProps {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

const CoursesTable = ({ courses, setCourses }: CoursesTableProps) => {
  const router = useRouter();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const onView = useCallback((course: Course) => {
    router.push(`/school-admin/courses/${course.id}`);
  }, []);

  const onDelete = useCallback((course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  }, []);

  const TableColumns = useMemo(() => courseColumns({ onView, onDelete }), []);

  return (
    <>
      <DeleteCourse
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        course={selectedCourse}
        setCourses={setCourses}
      />
      <CoursesDataTable data={courses} columns={TableColumns} />
    </>
  );
};

export default CoursesTable;
