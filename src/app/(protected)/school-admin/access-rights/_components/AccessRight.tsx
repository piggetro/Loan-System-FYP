"use client";

import React, { useCallback, useMemo, useState } from "react";
import { DataTable } from "./DataTable";
import { AccessRights, columns } from "./Columns";
import { useToast } from "@/app/_components/ui/use-toast";
import EditAccessRightForm from "./EditAccessRightForm";
import DeleteAccessRight from "./DeleteAccessRight";

interface AccessRightProps {
  data: AccessRights[];
}

const AccessRight = ({ data }: AccessRightProps) => {

  const [accessRights, setAccessRights] = useState<AccessRights[]>(data);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedAccessRight, setSelectedAccessRight] =
    useState<AccessRights | null>(null);

  const onEdit = useCallback((accessRight: AccessRights) => {
    setSelectedAccessRight(accessRight);
    setIsDialogOpen(true);
  }, []);

  const onDelete = useCallback((accessRight: AccessRights) => {
    setSelectedAccessRight(accessRight);
    setIsDeleteDialogOpen(true);
  }, []);


  const TableColumns = useMemo(() => columns({ onEdit, onDelete }), []);

  return (
    <>
      <DeleteAccessRight
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        accessRight={selectedAccessRight}
        setAccessRights={setAccessRights}
      />
      <EditAccessRightForm
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        accessRight={selectedAccessRight}
        setAccessRights={setAccessRights}
      />
      <DataTable data={accessRights} columns={TableColumns} />
    </>
  );
};

export default AccessRight;
