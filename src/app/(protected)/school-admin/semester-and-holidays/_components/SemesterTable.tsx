"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Semester, semesterColumns } from "./SemesterColumns";
import DeleteSemester from "./DeleteSemester";
import EditSemesterForm from "./EditSemesterForm";
import { DataTable } from "./DataTable";

interface SemesterTableProps {
  semester: Semester[];
  setSemesters: React.Dispatch<React.SetStateAction<Semester[]>>;
}

const SemesterTable = ({ semester, setSemesters }: SemesterTableProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(
    null,
  );

  const onEdit = useCallback((semester: Semester) => {
    setSelectedSemester(semester);
    setIsDialogOpen(true);
  }, []);

  const onDelete = useCallback((semester: Semester) => {
    setSelectedSemester(semester);
    setIsDeleteDialogOpen(true);
  }, []);

  const TableColumns = useMemo(() => semesterColumns({ onEdit, onDelete }), []);

  return (
    <>
      <DeleteSemester
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        semester={selectedSemester}
        setSemesters={setSemesters}
      />
      <EditSemesterForm
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        semester={selectedSemester}
        setSemesters={setSemesters}
      />
      <DataTable data={semester} columns={TableColumns} />
    </>
  );
};

export default SemesterTable;
