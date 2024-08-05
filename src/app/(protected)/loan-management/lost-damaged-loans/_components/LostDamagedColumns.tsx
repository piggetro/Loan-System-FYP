/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { LostDamagedRowActionsProps } from "./LostDamagedLoanRowAction";
import { type LostDamagedLoanType } from "./LostDamaged";

interface LoanProps {
  onView: (value: LostDamagedLoanType) => void;
}

export const LostDamagedColumns = ({
  onView,
}: LoanProps): ColumnDef<LostDamagedLoanType>[] => [
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
    accessorKey: "remarks",
    header: "Details",
    cell: ({ row }) => (
      <div className=" grow whitespace-pre-wrap font-semibold text-red-500">
        {row.getValue("remarks") === ""
          ? "No Outstanding Remarks"
          : toStartCase(row.getValue("remarks"))}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center">
        <div
          className={`mr-2 h-3 w-3 rounded-full ${row.getValue("status") === "RETURNED" ? "bg-green-500" : "bg-yellow-500"}`}
        ></div>
        <span>{toStartCase(row.getValue("status"))}</span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <LostDamagedRowActionsProps row={row} onView={onView} />,
  },
];

function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
