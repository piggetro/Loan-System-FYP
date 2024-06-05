"use client";

import { ColumnDef } from "@tanstack/react-table";
import CourseDataTableRowActions from "./CourseDataTableRowAction";

export type Course = {
    id: string;
    name: string;
    code: string;
    active: boolean;
};

interface CourseColumnsProps {
    onView: (value: Course)=> void;
    onDelete: (value:Course) => void;
}

export const CourseColumns = ({
    onView,
    onDelete,
  }: CourseColumnsProps): ColumnDef<Course>[] => [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "code",
      header: "Course Code",
    },
    {
      accessorKey: "active",
      header: "Active",
    },
  
    {
      id: "actions",
      cell: ({ row }) => (
        <CourseDataTableRowActions row={row} onView={onView} onDelete={onDelete} />
      ),
    },
  ];
  