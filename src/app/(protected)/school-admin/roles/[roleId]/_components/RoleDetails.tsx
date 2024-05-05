"use client";

import React, { useCallback, useMemo, useState } from "react";
import RoleInfo, { Role } from "./RoleInfo";
import { AccessRights, accessRightColumns } from "./AccessRightColumns";
import { Button } from "@/app/_components/ui/button";
import { Separator } from "@/app/_components/ui/separator";
import { AccessRightDataTable } from "./AccessRightDataTable";
import DeleteAccessRight from "./DeleteAccessRight";
import AddAccessRight from "./AddAccessRight";

interface RoleDetailsProps {
  role: Role & { accessRights: AccessRights[] };
}

const RoleDetails = ({ role: data }: RoleDetailsProps) => {
  const [role, setRole] = useState<Role>({ id: data.id, role: data.role });

  const [accessRights, setAccessRights] = useState<AccessRights[]>(
    data.accessRights,
  );
  const [selectedAccessRight, setSelectedAccessRight] =
    useState<AccessRights | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const onDelete = useCallback((accessRight: AccessRights) => {
    setSelectedAccessRight(accessRight);
    setIsDeleteDialogOpen(true);
  }, []);

  const TableColumns = useMemo(() => accessRightColumns({ onDelete }), []);

  return (
    <div className="mt-6 rounded-md bg-white px-6 py-4">
      <RoleInfo role={role} setRole={setRole} />
      <Separator className="my-3" />
      <AddAccessRight
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        setAccessRights={setAccessRights}
        roleId={role.id}
      />
      <DeleteAccessRight
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        accessRight={selectedAccessRight}
        setAccessRghts={setAccessRights}
        roleId={role.id}
      />
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Access Rights</h3>
        <Button onClick={() => setIsDialogOpen(true)}>
          Grant More Access Rights
        </Button>
      </div>
      <AccessRightDataTable data={accessRights} columns={TableColumns} />
    </div>
  );
};

export default RoleDetails;
