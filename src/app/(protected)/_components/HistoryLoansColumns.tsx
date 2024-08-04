"use client";

import type { ColumnDef } from "@tanstack/react-table";
import LoanDataTableRowActions from "./LoanDataTableRowActions";
import { type LoanStatus } from "@/db/enums";

export type HistoryLoans = {
  name: string | null;
  id: string;
  loanId: string;
  status: LoanStatus;
  dateCreated: Date;
  dateReturned: Date | null;
};

interface HistoryLoansProps {
  onView: (value: HistoryLoans) => void;
}

export const historyLoansColumns = ({
  onView,
}: HistoryLoansProps): ColumnDef<HistoryLoans>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
  },
  {
    accessorKey: "name",
    header: "Approver",
    cell: ({ row }) => {
      return <span>{row.getValue("name")}</span>;
    },
  },
  {
    accessorKey: "dateCreated",
    header: "Date Created",
    cell: (props) => {
      const date = props.cell.getValue() as Date;
      return (
        <span>{date === null ? "-" : date?.toLocaleDateString("en-SG")}</span>
      );
    },
  },
  {
    accessorKey: "dateReturned",
    header: "Date Returned",
    cell: (props) => {
      const date = props.cell.getValue() as Date;
      return (
        <span>{date === null ? "-" : date?.toLocaleDateString("en-SG")}</span>
      );
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
