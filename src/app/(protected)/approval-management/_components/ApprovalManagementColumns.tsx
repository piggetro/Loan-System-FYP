/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { Button } from "@/app/_components/ui/button";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { type ApprovalManagementType } from "../page";
import {
  ApprovalManagementTableRowActionsProps,
  ApprovalManagementHistoryTableRowActionsProps,
} from "./ApprovalManagementRowAction";

interface ApprovalManagementProps {
  onView: (value: ApprovalManagementType) => void;
  onApprove: (value: ApprovalManagementType) => void;
  onReject: (value: ApprovalManagementType) => void;
}

export const ApprovalManagementColumns = ({
  onView,
  onApprove,
  onReject,
}: ApprovalManagementProps): ColumnDef<ApprovalManagementType>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
    cell: ({ row }) => <div className="w-24">{row.getValue("loanId")}</div>,
  },
  {
    accessorKey: "loanedBy.name",
    id: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "dateCreated",
    header: ({ column }) => {
      return <p>Date Requested</p>;
    },
    cell: ({ row }) => {
      const dateCreated = new Date(
        row.getValue("dateCreated"),
      ).toLocaleDateString();
      return (
        <div className="" suppressHydrationWarning>
          {dateCreated}
        </div>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return <p>Due Date</p>;
    },
    cell: ({ row }) => {
      const dueDate = new Date(row.getValue("dueDate")).toLocaleDateString();
      return (
        <div className="" suppressHydrationWarning>
          {dueDate}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    id: "status",
    header: ({ column }) => {
      return <p>Status</p>;
    },
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
      <ApprovalManagementTableRowActionsProps
        row={row}
        onView={onView}
        onApprove={onApprove}
        onReject={onReject}
      />
    ),
  },
];

interface ApprovalManagementHistoryProps {
  onView: (value: ApprovalManagementType) => void;
}

export const ApprovalManagementHistoryColumns = ({
  onView,
}: ApprovalManagementHistoryProps): ColumnDef<ApprovalManagementType>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
    cell: ({ row }) => <div className="w-24">{row.getValue("loanId")}</div>,
  },
  {
    accessorKey: "loanedBy.name",
    id: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "dateCreated",
    header: ({ column }) => {
      return <p>Date Requested</p>;
    },
    cell: ({ row }) => {
      const dateCreated = new Date(
        row.getValue("dateCreated"),
      ).toLocaleDateString();
      return (
        <div className="" suppressHydrationWarning>
          {dateCreated}
        </div>
      );
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return <p>Due Date</p>;
    },
    cell: ({ row }) => {
      const dueDate = new Date(row.getValue("dueDate")).toLocaleDateString();
      return (
        <div className="" suppressHydrationWarning>
          {dueDate}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    id: "status",
    header: ({ column }) => {
      return <p>Status</p>;
    },
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
      <ApprovalManagementHistoryTableRowActionsProps
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
