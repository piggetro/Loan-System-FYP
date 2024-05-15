"use client";

import type { ColumnDef } from "@tanstack/react-table";
import StudentDataTableRowActions from "./StudentDataTableRowActions";

export type Student = {
  id: string;
  email: string;
  name: string;
  course: string;
  batch: string;
  graduationDate: Date | string;
};

interface StaffColumnsProps {
  onView: (value: Student) => void;
  onDelete: (value: Student) => void;
}

export const staffColumns = ({
  onView,
  onDelete,
}: StaffColumnsProps): ColumnDef<Student>[] => [
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
    accessorKey: "batch",
    header: "Batch",
  },
  {
    accessorKey: "graduationDate",
    header: "Graduation Date",
  },
  {
    accessorKey: "course",
    header: "Course",
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <StudentDataTableRowActions row={row} onView={onView} onDelete={onDelete} />
    ),
  },
];
