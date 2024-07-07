"use client";

import { ColumnDef } from "@tanstack/react-table";
import SemesterDataTableRowActions from "./SemesterDataTableRowActions";

export type Semester = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  numberOfDays: string;
};

interface SemesterColumnsProps {
  onEdit: (value: Semester) => void;
  onDelete: (value: Semester) => void;
}

export const semesterColumns = ({
  onEdit,
  onDelete,
}: SemesterColumnsProps): ColumnDef<Semester>[] => [
  {
    accessorKey: "name",
    header: "Semester",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: (props) => {
      const date = props.cell.getValue() as Date;
      return <span>{date?.toLocaleDateString("en-SG")}</span>;
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: (props) => {
      const date = props.cell.getValue() as Date;
      return <span>{date?.toLocaleDateString("en-SG")}</span>;
    },
  },
  {
    accessorKey: "numberOfDays",
    header: "Number of Days",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <SemesterDataTableRowActions
        row={row}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];
