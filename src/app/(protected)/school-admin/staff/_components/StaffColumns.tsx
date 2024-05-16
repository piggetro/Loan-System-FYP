"use client";

import type { ColumnDef } from "@tanstack/react-table";
import StaffDataTableRowActions from "./StaffDataTableRowActions";

export type Staff = {
  id: string;
  email: string;
  name: string;
  organizationUnit: string;
  staffType: string;
  role: string;
};

interface StaffColumnsProps {
  onView: (value: Staff) => void;
  onDelete: (value: Staff) => void;
}

export const staffColumns = ({
  onView,
  onDelete,
}: StaffColumnsProps): ColumnDef<Staff>[] => [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "organizationUnit",
    header: "Organization Unit",
  },
  {
    accessorKey: "staffType",
    header: "Staff Type",
  },
  {
    accessorKey: "role",
    header: "Role",
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <StaffDataTableRowActions row={row} onView={onView} onDelete={onDelete} />
    ),
  },
];
