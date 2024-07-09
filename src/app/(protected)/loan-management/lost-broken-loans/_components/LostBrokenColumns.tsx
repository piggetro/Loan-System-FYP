/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { LostBrokenRowActionsProps } from "./LostBrokenLoanRowAction";
import { type LostBrokenLoanType } from "./LostBroken";

interface LoanProps {
  onView: (value: LostBrokenLoanType) => void;
}

export const LostBrokenColumns = ({
  onView,
}: LoanProps): ColumnDef<LostBrokenLoanType>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
    cell: ({ row }) => <div className="w-20">{row.getValue("loanId")}</div>,
  },
  {
    accessorKey: "name",
    id: "name",
    header: "Name",
    cell: ({ row }) => <div className="">{row.getValue("name")}</div>,
  },

  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center">
        <div
          className={`mr-2 h-3 w-3 rounded-full ${
            row.getValue("status") === "Approved"
              ? "bg-green-500"
              : row.getValue("status") === "Pending" ||
                  row.getValue("status") === "Awaiting Request"
                ? "bg-yellow-500"
                : "bg-red-500"
          }`}
        ></div>
        <span>{toStartCase(row.getValue("status"))}</span>
      </div>
    ),
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => (
      <div className="grow">
        {row.getValue("remarks") === ""
          ? "No Outstanding Remarks"
          : row.getValue("remarks")}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <LostBrokenRowActionsProps row={row} onView={onView} />,
  },
];

function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
