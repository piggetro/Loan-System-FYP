/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { LoanTableHistoryRowActionsProps } from "./HistoryRowAction";
import { type HistoryLoanType } from "./History";

interface HistoryProps {
  onView: (value: HistoryLoanType) => void;
}

function toStartCase(string: string) {
  return string
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export const HistoryColumns = ({
  onView,
}: HistoryProps): ColumnDef<HistoryLoanType>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
    cell: ({ row }) => <div className="w-24">{row.getValue("loanId")}</div>,
  },
  {
    accessorKey: "name",
    id: "name",
    header: "Approver",
    cell: ({ row }) => <div className="">{row.getValue("name")}</div>,
  },

  {
    accessorKey: "dateCreated",
    header: "Date Created",
    cell: ({ row }) => (
      <div suppressHydrationWarning>
        {new Date(row.getValue("dateCreated")).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "dateReturned",
    header: "Date Returned",
    cell: ({ row }) => (
      <div suppressHydrationWarning>
        {row.getValue("dateReturned") === null
          ? "-"
          : new Date(row.getValue("dateReturned")).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      let statusColor;
      switch (row.getValue("status")) {
        case "RETURNED":
          statusColor = "bg-green-500";
          break;
        case "CANCELLED":
          statusColor = "bg-orange-400";
          break;
        case "REJECTED":
          statusColor = "bg-red-500";
          break;
      }

      return (
        <div className="flex items-center">
          <div className={`mr-2 h-3 w-3 rounded-full ${statusColor}`}></div>
          {toStartCase(row.getValue("status"))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <LoanTableHistoryRowActionsProps row={row} onView={onView} />
    ),
  },
];
