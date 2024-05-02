"use client";

import { ColumnDef } from "@tanstack/react-table";
import RolesDataTableRowActions from "./RolesDataTableRowActions";

export type Roles = {
  id: string;
  role: string;
  accessRightsCount: number;
  usersCount: number;
};

interface roleColumnProps {
  onView: (value: Roles) => void;
  onDelete: (value: Roles) => void;
}

export const roleColumns = ({
  onView,
  onDelete,
}: roleColumnProps): ColumnDef<Roles>[] => [
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "accessRightsCount",
    header: "Access Rights Count",
  },
  {
    accessorKey: "usersCount",
    header: "Users Count",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <RolesDataTableRowActions row={row} onView={onView} onDelete={onDelete} />
    ),
  },
];
