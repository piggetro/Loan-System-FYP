import React, { useCallback, useMemo, useState } from "react";
import { roleColumns, type Roles } from "./RolesColumns";
import { RolesDataTable } from "./RolesDataTable";
import DeleteRole from "./DeleteRole";
import { useRouter } from "next/navigation";

interface RolesTableProps {
  roles: Roles[];
  setRoles: React.Dispatch<React.SetStateAction<Roles[]>>;
}

const RolesTable = ({ roles, setRoles }: RolesTableProps) => {
  const router = useRouter();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<Roles | null>(null);

  const onView = useCallback((role: Roles) => {
    router.push(`/school-admin/roles/${role.id}`);
  }, []);

  const onDelete = useCallback((role: Roles) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  }, []);

  const TableColumns = useMemo(() => roleColumns({ onView, onDelete }), []);

  return (
    <>
      <DeleteRole
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        role={selectedRole}
        setRoles={setRoles}
      />
      <RolesDataTable data={roles} columns={TableColumns} />
    </>
  );
};

export default RolesTable;
