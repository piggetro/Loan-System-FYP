"use client";

import type { ColumnDef } from "@tanstack/react-table";
import LoanDataTableRowActions from "./LoanDataTableRowActions";

export type CurrentLoans = {
  id: string;
  loanId: string;
  dueDate: Date;
};

interface CurrentLoansProps {
  onView: (value: CurrentLoans) => void;
}

export const currentLoansColumns = ({
  onView,
}: CurrentLoansProps): ColumnDef<CurrentLoans>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: (props) => {
      const date = props.cell.getValue() as Date;
      return <span>{date?.toLocaleDateString("en-SG")}</span>;
    },
  },
  {
    accessorKey: "name",
    header: "Approver",
    cell: ({ row }) => {
      return <span>{row.getValue("name")}</span>;
    },
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
