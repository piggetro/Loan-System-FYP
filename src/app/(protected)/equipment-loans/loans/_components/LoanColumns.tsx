/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { type LoanTableDataType } from "../page";
import { LoanTablePendingApprovalRowActionsProps } from "./LoanRowAction";

interface LoanProps {
  onView: (value: LoanTableDataType) => void;
  onCancel: (value: LoanTableDataType) => void;
  onRequestCollection: (value: LoanTableDataType) => void;
}

export const LoanPendingApprovalColumns = ({
  onView,
  onCancel,
  onRequestCollection,
}: LoanProps): ColumnDef<LoanTableDataType>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
    cell: ({ row }) => <div className="w-24">{row.getValue("loanId")}</div>,
  },
  {
    accessorKey: "dateCreated",
    header: "Date Requested",
    cell: ({ row }) => (
      <div className="" suppressHydrationWarning>
        {new Date(row.getValue("dateCreated")).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => (
      <div className="" suppressHydrationWarning>
        {new Date(row.getValue("dueDate")).toLocaleDateString()}
      </div>
    ),
  },

  {
    accessorKey: "approverName",
    id: "approverName",
    header: "Approver",
    cell: ({ row }) => <div className="">{row.getValue("approverName")}</div>,
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
    cell: ({ row }) => (
      <LoanTablePendingApprovalRowActionsProps
        row={row}
        onView={onView}
        onCancel={onCancel}
        onRequestCollection={onRequestCollection}
      />
    ),
  },
];

function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
