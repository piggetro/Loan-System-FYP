/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { LoanTableCollectionRowActionsProps } from "./CollectionRowAction";
import { type CollectionLoanType } from "./Collection";

interface CollectionProps {
  onView: (value: CollectionLoanType) => void;
  onCollect: (value: CollectionLoanType) => void;
}

export const CollectionColumns = ({
  onView,
  onCollect,
}: CollectionProps): ColumnDef<CollectionLoanType>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
    cell: ({ row }) => <div className="w-96">{row.getValue("loanId")}</div>,
  },
  {
    accessorKey: "loanedBy.name",
    id: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="">{row.getValue("name") ?? "Deleted User"}</div>
    ),
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
      <LoanTableCollectionRowActionsProps
        row={row}
        onView={onView}
        onCollect={onCollect}
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
