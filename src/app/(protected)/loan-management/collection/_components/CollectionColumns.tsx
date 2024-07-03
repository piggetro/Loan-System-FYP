/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { LoanTableCollectionRowActionsProps } from "./CollectionRowAction";
import { type CollectionLoanType } from "./Collection";

interface CollectionProps {
  onView: (value: CollectionLoanType) => void;
  onCollect: (value: CollectionLoanType) => void;
}

export const CollectionColumns = ({
  onView,
  onCollect,
}: CollectionProps): ColumnDef<CollectionLoanType>[] => [
  {
    accessorKey: "loanId",
    header: "Loan ID",
    cell: ({ row }) => <div className="w-96">{row.getValue("loanId")}</div>,
  },
  {
    accessorKey: "loanedBy.name",
    id: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="">{row.getValue("name") ?? "Deleted User"}</div>
    ),
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
      <LoanTableCollectionRowActionsProps
        row={row}
        onView={onView}
        onCollect={onCollect}
      />
    ),
  },
];
