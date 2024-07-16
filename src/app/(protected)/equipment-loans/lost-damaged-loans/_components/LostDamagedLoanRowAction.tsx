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

interface LostDamagedLoanTableRowActionsProps<TData> {
  row: Row<TData>;
  onView: (value: TData) => void;
  onViewWaiver: (value: TData) => void;
}

export const LostDamagedLoanTableRowActionsProps = <TData,>({
  row,
  onView,
  onViewWaiver,
}: LostDamagedLoanTableRowActionsProps<TData>) => {
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
        </DropdownMenuItem>{" "}
        <DropdownMenuItem
          onClick={() => {
            onViewWaiver(row.original);
          }}
        >
          View Waiver
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
