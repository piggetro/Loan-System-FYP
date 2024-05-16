import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { staffColumns, type Student } from "./StudentColumns";
import { StudentDataTable } from "./StudentDataTable";
import DeleteStudent from "./DeleteStudent";

interface StudentTableProps {
  student: Student[];
  setStudent: React.Dispatch<React.SetStateAction<Student[]>>;
}

const StudentTable = ({ student, setStudent }: StudentTableProps) => {
  const router = useRouter();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const onView = useCallback((student: Student) => {
    router.push(`/school-admin/student/${student.id}`);
  }, []);

  const onDelete = useCallback((student: Student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  }, []);

  const TableColumns = useMemo(() => staffColumns({ onView, onDelete }), []);

  return (
    <>
      <DeleteStudent
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        student={selectedStudent}
        setStudent={setStudent}
      />
      <StudentDataTable data={student} columns={TableColumns} />
    </>
  );
};

export default StudentTable;
