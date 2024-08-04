/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { type WaiverType } from "../page";
import { LostDamagedLoanTableRowActionsProps } from "./WaiverRowAction";

interface WavierProps {
  onView: (value: WaiverType) => void;
  onViewWaiver: (value: WaiverType) => void;
}

export const WaiverColumns = ({
  onView,
  onViewWaiver,
}: WavierProps): ColumnDef<WaiverType>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
    cell: ({ row }) => <div className="w-20">{row.getValue("loanId")}</div>,
  },
  {
    accessorKey: "dateIssued",
    header: "Date Issued",
    cell: ({ row }) => (
      <div className="w-20" suppressHydrationWarning>
        {new Date(row.getValue("dateIssued")).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "dateUpdated",
    header: "Date Updated",
    cell: ({ row }) => (
      <div className="w-20" suppressHydrationWarning>
        {row.getValue("dateUpdated") !== null
          ? new Date(row.getValue("dateUpdated")).toLocaleDateString()
          : "-"}
      </div>
    ),
  },
  {
    accessorKey: "remarks",
    header: () => {
      return <p>Details</p>;
    },
    cell: ({ row }) => {
      return (
        <div className="grow whitespace-pre-wrap">
          {row.getValue("remarks") === ""
            ? "No Outstanding Items"
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
              row.getValue("status") === "APPROVED" ||
              row.getValue("status") === "RESOLVED"
                ? "bg-green-500"
                : row.getValue("status") === "REJECTED"
                  ? "bg-red-500"
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
