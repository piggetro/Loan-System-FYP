/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { type LostDamagedLoanType } from "../page";
import { LostDamagedLoanTableRowActionsProps } from "./LostDamagedLoanRowAction";

interface LostDamagedLoanProps {
  onView: (value: LostDamagedLoanType) => void;
}

export const LostDamagedLoanColumns = ({
  onView,
}: LostDamagedLoanProps): ColumnDef<LostDamagedLoanType>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
    cell: ({ row }) => <div className="w-20">{row.getValue("loanId")}</div>,
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
              row.getValue("status") === "Approved"
                ? "bg-green-500"
                : row.getValue("status") === "Partially Outstanding" ||
                    row.getValue("status") === "Awaiting Request" ||
                    row.getValue("status") === "Pending"
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
    accessorKey: "remarks",
    header: () => {
      return <p>Remarks</p>;
    },
    cell: ({ row }) => {
      return (
        <div className="grow">
          {row.getValue("remarks") === ""
            ? "No Outstanding Remarks"
            : row.getValue("remarks")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <LostDamagedLoanTableRowActionsProps row={row} onView={onView} />
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
