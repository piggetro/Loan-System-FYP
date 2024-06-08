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

interface CoursesDataTableRowActionsProps<TData> {
  row: Row<TData>;
  onView: (value: TData) => void;
  onDelete: (value: TData) => void;
}

const CoursesDataTableRowActions = <TData,>({
  row,
  onView,
  onDelete,
}: CoursesDataTableRowActionsProps<TData>) => {
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
          View Course
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onDelete(row.original);
          }}
          className="text-red-500 focus:bg-red-100 focus:text-red-500"
        >
          Delete Course
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CoursesDataTableRowActions;
