/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { Button } from "@/app/_components/ui/button";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { type WaiverType } from "../page";
import {
  WaiverTableHistoryRowActionsProps,
  WaiverTableRowActionsProps,
} from "./WaiverRowAction";

interface WaiverProps {
  onView: (value: WaiverType) => void;
}

export const WaiverColumns = ({
  onView,
}: WaiverProps): ColumnDef<WaiverType>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
    cell: ({ row }) => <div className="w-20">{row.getValue("loanId")}</div>,
  },
  {
    accessorKey: "loanedBy",
    id: "name",
    header: ({ column }) => {
      return <p>Loaned By</p>;
    },
    cell: ({ row }) => <div className="">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "dateIssued",
    header: ({ column }) => {
      return <p>Date Issued</p>;
    },
    cell: ({ row }) => {
      const dateCreated = new Date(
        row.getValue("dateIssued"),
      ).toLocaleDateString();
      return (
        <div className="" suppressHydrationWarning>
          {dateCreated}
        </div>
      );
    },
  },
  {
    accessorKey: "remarks",
    header: ({ column }) => {
      return <p>Remarks</p>;
    },
    cell: ({ row }) => {
      return <div className="grow">{row.getValue("remarks")}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center">
        <div
          className={`mr-2 h-3 w-3 rounded-full ${
            row.getValue("status") === "APPROVED"
              ? "bg-green-500"
              : row.getValue("status") === "REJECTED"
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
    cell: ({ row }) => <WaiverTableRowActionsProps row={row} onView={onView} />,
  },
];

interface WaiverHistoryProps {
  onView: (value: WaiverType) => void;
}

export const WaiverHistoryColumns = ({
  onView,
}: WaiverHistoryProps): ColumnDef<WaiverType>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
    cell: ({ row }) => <div className="w-20">{row.getValue("loanId")}</div>,
  },
  {
    accessorKey: "loanedBy",
    id: "name",
    header: ({ column }) => {
      return <p>Loaned By</p>;
    },
    cell: ({ row }) => <div className="">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "dateIssued",
    header: ({ column }) => {
      return <p>Date Issued</p>;
    },
    cell: ({ row }) => {
      const dateCreated = new Date(
        row.getValue("dateIssued"),
      ).toLocaleDateString();
      return (
        <div className="" suppressHydrationWarning>
          {dateCreated}
        </div>
      );
    },
  },
  {
    accessorKey: "remarks",
    header: ({ column }) => {
      return <p>Remarks</p>;
    },
    cell: ({ row }) => {
      return <div className="grow">{row.getValue("remarks")}</div>;
    },
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
    cell: ({ row }) => <WaiverTableRowActionsProps row={row} onView={onView} />,
  },
];

function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
