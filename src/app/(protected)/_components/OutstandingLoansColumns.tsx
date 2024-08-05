"use client";

import type { ColumnDef } from "@tanstack/react-table";
import LoanDataTableRowActions from "./LoanDataTableRowActions";

export type OverdueLoans = {
  id: string;
  loanId: string;
  dueDate: Date;
  remarks: string;
  dateCreated: Date;
  status: string;
};

interface OverdueLoansProps {
  onView: (value: OverdueLoans) => void;
}

export const overdueLoansColumns = ({
  onView,
}: OverdueLoansProps): ColumnDef<OverdueLoans>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
  },
  {
    accessorKey: "dateCreated",
    header: "Date Created",
    cell: (props) => {
      const date = props.cell.getValue() as Date;
      return <span className={``}>{date?.toLocaleDateString("en-SG")}</span>;
    },
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: (props) => {
      const date = props.cell.getValue() as Date;
      return (
        <span
          className={`\ ${date < new Date() ? "font-semibold text-red-500" : ""}`}
        >
          {date?.toLocaleDateString("en-SG")}
        </span>
      );
    },
  },
  {
    accessorKey: "remarks",
    header: "Details",
    cell: ({ row }) => (
      <div className="flex items-center">
        <span
          className={`whitespace-pre ${row.getValue("remarks") === "" ? "" : "font-semibold text-red-500"}`}
        >
          {row.getValue("remarks") === ""
            ? "-"
            : toStartCase(row.getValue("remarks"))}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center">
        <div
          className={`mr-2 h-3 w-3 rounded-full ${
            row.getValue("status") === "COLLECTED" ||
            row.getValue("status") === "RETURNED"
              ? "bg-green-500"
              : row.getValue("status") === "REJECTED" ||
                  row.getValue("status") === "CANCELLED" ||
                  row.getValue("status") === "OVERDUE"
                ? "bg-red-500"
                : "bg-yellow-500"
          }`}
        ></div>
        <span>{toStartCase(row.getValue("status"))}</span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <LoanDataTableRowActions row={row} onView={onView} />,
  },
];
function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
