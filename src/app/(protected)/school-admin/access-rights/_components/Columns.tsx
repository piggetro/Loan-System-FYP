"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { Cell, Row, Column, Table } from "@tanstack/react-table";

export type AccessRights = {
  id: string;
  pageName: string;
  pageLink: string;
};

type TableCellProps<T> = {
  getValue: () => any;
  row: Row<T>;
  column: Column<T>;
  table: Table<T>;
};

const TableCell = <T extends object>({
  getValue,
  row,
  column,
  table,
}: TableCellProps<T>) => {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  const onBlur = () => {
    table.options.meta?.updateData(row.index, column.id, value);
  };
  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
    />
  );
};

export const columns: ColumnDef<AccessRights>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "pageName",
    header: "Page Name",
    cell: TableCell,
  },
  {
    accessorKey: "pageLink",
    header: "Page Link",
    cell: TableCell,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

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
            <DropdownMenuItem>Edit Access Right</DropdownMenuItem>
            <DropdownMenuItem>Delete Access Right</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
