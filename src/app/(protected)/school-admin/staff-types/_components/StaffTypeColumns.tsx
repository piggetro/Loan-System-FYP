"use client";

import { ColumnDef } from "@tanstack/react-table";
import DataTableRowActions from "./DataTableRowActions";

export type StaffTypes = {
  id: string;
  name: string;
};

interface ColumnProps {
  onEdit: (value: StaffTypes) => void;
  onDelete: (value: StaffTypes) => void;
}

export const columns = ({
  onEdit,
  onDelete,
}: ColumnProps): ColumnDef<StaffTypes>[] => [
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
