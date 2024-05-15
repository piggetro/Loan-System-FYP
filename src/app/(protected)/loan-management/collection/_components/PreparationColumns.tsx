/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { Button } from "@/app/_components/ui/button";
import { Loan } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { PreparationRowActionsProps } from "./LoanRowAction";
import { PreparationLoanType } from "./Preparation";

interface LoanProps {
  onView: (value: PreparationLoanType) => void;
  onPreparation: (value: PreparationLoanType) => void;
}

export const PreparationColumns = ({
  onView,
  onPreparation,
}: LoanProps): ColumnDef<Loan>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
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
        {new Date(row.getValue("dueDate")).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <div className="">{row.getValue("status")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <PreparationRowActionsProps
        row={row}
        onView={onView}
        onPreparation={onPreparation}
      />
    ),
  },
];
