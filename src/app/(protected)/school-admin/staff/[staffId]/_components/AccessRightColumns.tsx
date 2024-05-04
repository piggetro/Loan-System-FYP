"use client";

import { ColumnDef } from "@tanstack/react-table";
import AccessRightDataTableRowActions from "./AccessRightDataTableRowActions";

export type AccessRights = {
  id: string;
  pageName: string;
  pageLink: string;
  grantedBy: string;
};

interface AccessRightColumnProps {
  onDelete: (value: AccessRights) => void;
}

export const accessRightColumns = ({
  onDelete,
}: AccessRightColumnProps): ColumnDef<AccessRights>[] => [
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
    accessorKey: "grantedBy",
    header: "Granted By",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <AccessRightDataTableRowActions row={row} onDelete={onDelete} />
    ),
  },
];
