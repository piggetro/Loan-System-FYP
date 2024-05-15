import { Row } from "@tanstack/react-table";
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
import { api } from "@/trpc/react";

interface ApprovalManagementTableRowActionsProps<TData> {
  row: Row<TData>;
  onView: (value: TData) => void;
  onApprove: (value: TData) => void;
  onReject: (value: TData) => void;
}

export const ApprovalManagementTableRowActionsProps = <TData,>({
  row,
  onView,
  onApprove,
  onReject,
}: ApprovalManagementTableRowActionsProps<TData>) => {
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
        <DropdownMenuItem
          onClick={() => {
            onApprove(row.original);
          }}
          className="text-primary focus:bg-blue-100 focus:text-blue-500"
        >
          Approve Loan
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onReject(row.original);
          }}
          className="text-red-500 focus:bg-red-100 focus:text-red-500"
        >
          Reject Loan
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface ApprovalManagementHistoryTableRowActionsProps<TData> {
  row: Row<TData>;
  onView: (value: TData) => void;
}

export const ApprovalManagementHistoryTableRowActionsProps = <TData,>({
  row,
  onView,
}: ApprovalManagementHistoryTableRowActionsProps<TData>) => {
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
