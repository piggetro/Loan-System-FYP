import React, { useCallback, useMemo, useState } from "react";
import { StaffDataTable } from "./StaffDataTable";
import { type Staff, staffColumns } from "./StaffColumns";
import { useRouter } from "next/navigation";
import DeleteStaff from "./DeleteStaff";

interface StaffTableProps {
  staff: Staff[];
  setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
}

const StaffTable = ({ staff, setStaff }: StaffTableProps) => {
  const router = useRouter();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  const onView = useCallback((staff: Staff) => {
    router.push(`/school-admin/staff/${staff.id}`);
  }, []);

  const onDelete = useCallback((staff: Staff) => {
    setSelectedStaff(staff);
    setIsDeleteDialogOpen(true);
  }, []);

  const TableColumns = useMemo(() => staffColumns({ onView, onDelete }), []);

  return (
    <>
      <DeleteStaff
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        staff={selectedStaff}
        setStaff={setStaff}
      />
      <StaffDataTable data={staff} columns={TableColumns} />
    </>
  );
};

export default StaffTable;
