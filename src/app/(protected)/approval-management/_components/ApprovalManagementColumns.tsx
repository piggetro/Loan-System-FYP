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
    cell: ({ row }) => <div className="w-96">{row.getValue("loanId")}</div>,
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
      console.log(row.getValue("dateCreated"));
      const dateCreated = new Date(row.getValue("dateCreated"));
      return <div className="">{dateCreated.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return <p>Return Date</p>;
    },
    cell: ({ row }) => {
      const dueDate = new Date(row.getValue("dueDate"));
      return <div className="">{dueDate.toLocaleDateString()}</div>;
    },
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
    cell: ({ row }) => <div className="w-96">{row.getValue("loanId")}</div>,
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
      console.log(row.getValue("dateCreated"));
      const dateCreated = new Date(row.getValue("dateCreated"));
      return <div className="">{dateCreated.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return <p>Return Date</p>;
    },
    cell: ({ row }) => {
      const dueDate = new Date(row.getValue("dueDate"));
      return <div className="">{dueDate.toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: "status",
    id: "status",
    header: ({ column }) => {
      return <p>Status</p>;
    },
    cell: ({ row }) => <div className="">{row.getValue("status")}</div>,
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
