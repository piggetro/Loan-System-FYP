"use client";

import { ColumnDef } from "@tanstack/react-table";
import DataTableRowActions from "./DataTableRowActions";

export type OrganizationUnits = {
  id: string;
  name: string;
};

interface ColumnProps {
  onEdit: (value: OrganizationUnits) => void;
  onDelete: (value: OrganizationUnits) => void;
}

export const columns = ({
  onEdit,
  onDelete,
}: ColumnProps): ColumnDef<OrganizationUnits>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];
