import type { Row } from "@tanstack/react-table";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { Button } from "@/app/_components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface LoanTableRowActionsProps<TData> {
  row: Row<TData>;
  onView: (id: TData) => void;
  onCancel: (id: TData) => void;
  onRequestCollection: (id: TData) => void;
}

export const LoanTablePendingApprovalRowActionsProps = <TData,>({
  row,
  onView,
  onCancel,
  onRequestCollection,
}: LoanTableRowActionsProps<TData>) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => {
            onView(row.original);
          }}
        >
          View Loan
        </DropdownMenuItem>

        {row.getValue("status") == "REQUEST_COLLECTION" ? (
          <DropdownMenuItem
            onClick={() => {
              onRequestCollection(row.original);
            }}
            className=""
          >
            Request Collection
          </DropdownMenuItem>
        ) : null}
        {row.getValue("status") == "PENDING_APPROVAL" ||
        row.getValue("status") == "APPROVED" ? (
          <DropdownMenuItem
            onClick={() => {
              onCancel(row.original);
            }}
            className="text-red-500 focus:bg-red-100 focus:text-red-500"
          >
            Cancel Request
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
