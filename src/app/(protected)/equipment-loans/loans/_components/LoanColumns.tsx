/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { Button } from "@/app/_components/ui/button";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { LoanTableDataType } from "../page";
import { LoanTablePendingApprovalRowActionsProps } from "./LoanRowAction";

interface LoanProps {
  onView: (value: LoanTableDataType) => void;
  onCancel: (value: LoanTableDataType) => void;
  onRequestCollection: (value: LoanTableDataType) => void;
}

export const LoanPendingApprovalColumns = ({
  onView,
  onCancel,
  onRequestCollection,
}: LoanProps): ColumnDef<LoanTableDataType>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
    cell: ({ row }) => <div className="w-96">{row.getValue("loanId")}</div>,
  },
  {
    accessorKey: "dateCreated",
    header: "Date Requested",
    cell: ({ row }) => (
      <div className="" suppressHydrationWarning>
        {new Date(row.getValue("dateCreated")).toLocaleDateString("en-SG")}
      </div>
    ),
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => (
      <div className="" suppressHydrationWarning>
        {new Date(row.getValue("dueDate")).toLocaleDateString("en-SG")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <div className="">{row.getValue("status")}</div>,
  },
  {
    accessorKey: "approvingLecturer.name",
    id: "name",
    header: "Approving Lecturer",
    cell: ({ row }) => <div className="">{row.getValue("name")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <LoanTablePendingApprovalRowActionsProps
        row={row}
        onView={onView}
        onCancel={onCancel}
        onRequestCollection={onRequestCollection}
      />
    ),
  },
];
