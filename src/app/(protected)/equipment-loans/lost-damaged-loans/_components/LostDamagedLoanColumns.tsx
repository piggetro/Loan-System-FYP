/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { type LostDamagedLoanType } from "../page";
import { LostDamagedLoanTableRowActionsProps } from "./LostDamagedLoanRowAction";

interface LostDamagedLoanProps {
  onView: (value: LostDamagedLoanType) => void;
  onViewWaiver: (value: LostDamagedLoanType) => void;
}

export const LostDamagedLoanColumns = ({
  onView,
  onViewWaiver,
}: LostDamagedLoanProps): ColumnDef<LostDamagedLoanType>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
    cell: ({ row }) => <div className="w-20">{row.getValue("loanId")}</div>,
  },

  {
    accessorKey: "approver",
    header: "Approver",
    cell: ({ row }) => <div>{row.getValue("approver")}</div>,
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
    accessorKey: "remarks",
    header: () => {
      return <p>Remarks</p>;
    },
    cell: ({ row }) => {
      return (
        <div className="grow whitespace-pre-wrap font-semibold text-red-500">
          {row.getValue("remarks") === ""
            ? "No Outstanding Remarks"
            : row.getValue("remarks")}
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
              row.getValue("status") === "RETURNED"
                ? "bg-green-500"
                : row.getValue("status") === "PARTIALLY OUTSTANDING"
                  ? "bg-yellow-500"
                  : "bg-red-500"
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
      <LostDamagedLoanTableRowActionsProps
        onViewWaiver={onViewWaiver}
        row={row}
        onView={onView}
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
