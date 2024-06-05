import { type Row } from "@tanstack/react-table";
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
  onCollect: (id: TData) => void;
}

export const LoanTableCollectionRowActionsProps = <TData,>({
  row,
  onView,
  onCollect,
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

        <DropdownMenuItem
          onClick={() => {
            onCollect(row.original);
          }}
          className=""
        >
          Proccess Collection
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
