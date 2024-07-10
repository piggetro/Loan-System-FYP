/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { type OverdueLoanType } from "../page";
import { OverdueLoanTableRowActionsProps } from "./OverdueLoanRowAction";

interface OverdueLoanProps {
  onView: (value: OverdueLoanType) => void;
}

export const OverdueLoanColumns = ({
  onView,
}: OverdueLoanProps): ColumnDef<OverdueLoanType>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
    cell: ({ row }) => <div className="w-20">{row.getValue("loanId")}</div>,
  },
  {
    accessorKey: "issuedByname",
    header: () => {
      return <p>Issued By</p>;
    },
    cell: ({ row }) => {
      return <div className="">{row.getValue("issuedByname")}</div>;
    },
  },

  {
    accessorKey: "dueDate",
    header: () => {
      return <p>Due Date</p>;
    },
    cell: ({ row }) => {
      return (
        <div
          className="grow font-semibold text-red-500"
          suppressHydrationWarning
        >
          {new Date(row.getValue("dueDate")).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    accessorKey: "dateCollected",
    header: () => {
      return <p>Date Collected</p>;
    },
    cell: ({ row }) => {
      return (
        <div className="grow " suppressHydrationWarning>
          {new Date(row.getValue("dateCollected")).toLocaleDateString()}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => {
      return <p>Status</p>;
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <div
            className={`mr-2 h-3 w-3 rounded-full ${
              row.getValue("status") === "COLLECTED"
                ? "bg-green-500"
                : "bg-yellow-500"
            }`}
          ></div>
          {toStartCase(row.getValue("status"))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <OverdueLoanTableRowActionsProps row={row} onView={onView} />
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
