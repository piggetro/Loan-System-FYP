"use client";

import { ColumnDef } from "@tanstack/react-table";
import HolidayDataTableRowActions from "./HolidayDataTableRowActions";

export type Holiday = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  numberOfDays: string;
};

interface HolidayColumnsProps {
  onEdit: (value: Holiday) => void;
  onDelete: (value: Holiday) => void;
}

export const holidayColumns = ({
  onEdit,
  onDelete,
}: HolidayColumnsProps): ColumnDef<Holiday>[] => [
  {
    accessorKey: "name",
    header: "Holiday",
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
      <HolidayDataTableRowActions
        row={row}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];
