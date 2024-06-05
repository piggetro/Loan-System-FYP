"use client";

import React, { useCallback, useMemo, useState } from "react";
import { DataTable } from "./DataTable";
import { OrganizationUnits, columns } from "./OrganizationUnitColumns";
import EditOrganizationUnitForm from "./EditOrganizationUnitForm";
import DeleteOrganizationUnit from "./DeleteOrganizationUnit";

interface organizationUnitTableProps {
  organizationUnits: OrganizationUnits[];
  setOrganizationUnits: React.Dispatch<React.SetStateAction<OrganizationUnits[]>>;
}

const OrganizationUnitTable = ({
  organizationUnits,
  setOrganizationUnits,
}: organizationUnitTableProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [selectedOrganizationUnit, setSelectedOrganizationUnit] =
    useState<OrganizationUnits | null>(null);

  const onEdit = useCallback((organizationUnit: OrganizationUnits) => {
    setSelectedOrganizationUnit(organizationUnit);
    setIsDialogOpen(true);
  }, []);

  const onDelete = useCallback((organizationUnit: OrganizationUnits) => {
    setSelectedOrganizationUnit(organizationUnit);
    setIsDeleteDialogOpen(true);
  }, []);

  const TableColumns = useMemo(() => columns({ onEdit, onDelete }), []);

  return (
    <>
      <DeleteOrganizationUnit
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        organizationUnit={selectedOrganizationUnit}
        setOrganizationUnits={setOrganizationUnits}
      />
      <EditOrganizationUnitForm
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        organizationUnit={selectedOrganizationUnit}
        setOrganizationUnits={setOrganizationUnits}
      />
      <DataTable data={organizationUnits} columns={TableColumns} />
    </>
  );
};

export default OrganizationUnitTable;
