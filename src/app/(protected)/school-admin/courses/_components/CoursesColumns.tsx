"use client";

import type { ColumnDef } from "@tanstack/react-table";
import CoursesDataTableRowActions from "./CoursesDataTableRowActions";

export type Course = {
  id: string;
  name: string;
  code: string;
  active: boolean;
};

interface courseColumnProps {
  onView: (value: Course) => void;
  onDelete: (value: Course) => void;
}

export const courseColumns = ({
  onView,
  onDelete,
}: courseColumnProps): ColumnDef<Course>[] => [
  {
    accessorKey: "name",
    header: "Course",
  },
  {
    accessorKey: "code",
    header: "Course Code",
  },
  {
    accessorKey: "active",
    header: "Active",
    cell: (props) => (
      <div className="flex items-center">
        <div
          className={`mr-2 h-3 w-3 rounded-full ${
            props.cell.getValue() ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
        <span>{props.cell.getValue() ? "Active" : "Inactive"}</span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CoursesDataTableRowActions
        row={row}
        onView={onView}
        onDelete={onDelete}
      />
    ),
  },
];
