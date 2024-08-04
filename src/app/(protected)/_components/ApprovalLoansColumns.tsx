"use client";

import type { ColumnDef } from "@tanstack/react-table";
import LoanDataTableRowActions from "./LoanDataTableRowActions";
import { LoanStatus } from "@/db/enums";
import { Button } from "@/app/_components/ui/button";
import { ArrowUpDown } from "lucide-react";

export type ApprovalLoans = {
  id: string;
  loanId: string;
  dueDate: Date;
  status: LoanStatus;
  dateCreated: Date;
  loanedBy: {
    name: string;
  } | null;
};

interface ApprovalLoansProps {
  onView: (value: ApprovalLoans) => void;
}

export const approvalLoansColumns = ({
  onView,
}: ApprovalLoansProps): ColumnDef<ApprovalLoans>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
  },
  {
    accessorKey: "loanedBy.name",
    id: "name",
    header: ({ column }) => {
      return <div>Borrower</div>;
    },
    cell: ({ row }) => <div className="">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "dateCreated",
    header: "Date Created",
    cell: (props) => {
      const date = props.cell.getValue() as Date;
      return <span>{date?.toLocaleDateString("en-SG")}</span>;
    },
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
