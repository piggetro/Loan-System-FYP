/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { PreparationRowActionsProps } from "./TrackLoansLoanRowAction";
import { type TrackLoansType } from "./TrackLoans";
import { Button } from "@/app/_components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface LoanProps {
  onView: (value: TrackLoansType) => void;
}

export const PreparationColumns = ({
  onView,
}: LoanProps): ColumnDef<TrackLoansType>[] => [
  {
    accessorKey: "loanId",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Loan ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="w-96">{row.getValue("loanId")}</div>,
  },
  {
    accessorKey: "loanedBy.name",
    id: "name",
    header: "Name",
    cell: ({ row }) => <div className="">{row.getValue("name")}</div>,
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
        {new Date(row.getValue("dueDate")) < new Date() ? (
          <p className="font-semibold text-red-500">
            {new Date(row.getValue("dueDate")).toLocaleDateString()}
          </p>
        ) : (
          <p>{new Date(row.getValue("dueDate")).toLocaleDateString()}</p>
        )}
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
                  row.getValue("status") === "CANCELLED"
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
    cell: ({ row }) => <PreparationRowActionsProps row={row} onView={onView} />,
  },
];

function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
