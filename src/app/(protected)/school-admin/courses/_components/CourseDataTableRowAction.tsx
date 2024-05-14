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

interface CourseDataTableRowActionsProps<TData> {
    row: Row<TData>;
    onView: (value: TData) => void;
    onDelete: (value:TData) => void;
}

const CourseDataTableRowActions = <TData,>({
    row,
    onView,
    onDelete,
}: CourseDataTableRowActionsProps<TData>) => {
    return(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open Menu</span>
            <MoreHorizontal className="h-4 w-4"/>
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
};
export default CourseDataTableRowActions;