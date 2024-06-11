"use client";

import React, { useCallback, useMemo, useState } from "react";
import { DataTable } from "./DataTable";
import { StaffTypes, columns } from "./StaffTypeColumns";
import EditStaffTypeForm from "./EditStaffTypeForm";
import DeleteStaffType from "./DeleteStaffType";

interface staffTypeTableProps {
  staffTypes: StaffTypes[];
  setStaffTypes: React.Dispatch<React.SetStateAction<StaffTypes[]>>;
}

const StaffTypeTable = ({
  staffTypes,
  setStaffTypes,
}: staffTypeTableProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedStaffType, setSelectedStaffType] =
    useState<StaffTypes | null>(null);

  const onEdit = useCallback((staffType: StaffTypes) => {
    setSelectedStaffType(staffType);
    setIsDialogOpen(true);
  }, []);

  const onDelete = useCallback((staffType: StaffTypes) => {
    setSelectedStaffType(staffType);
    setIsDeleteDialogOpen(true);
  }, []);

  const TableColumns = useMemo(() => columns({ onEdit, onDelete }), []);

  return (
    <>
      <DeleteStaffType
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        staffType={selectedStaffType}
        setStaffTypes={setStaffTypes}
      />
      <EditStaffTypeForm
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        staffType={selectedStaffType}
        setStaffTypes={setStaffTypes}
      />
      <DataTable data={staffTypes} columns={TableColumns} />
    </>
  );
};

export default StaffTypeTable;
