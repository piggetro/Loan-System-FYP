"use client";

import { ColumnDef } from "@tanstack/react-table";
import DataTableRowActions from "./DataTableRowActions";

export type AccessRights = {
  id: string;
  pageName: string;
  pageLink: string;
};

interface ColumnProps {
  onEdit: (value: AccessRights) => void;
  onDelete: (value: AccessRights) => void;
}

export const columns = ({
  onEdit,
  onDelete,
}: ColumnProps): ColumnDef<AccessRights>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "pageName",
    header: "Page Name",
  },
  {
    accessorKey: "pageLink",
    header: "Page Link",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];
