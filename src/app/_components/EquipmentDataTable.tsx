"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { useEffect, useState } from "react";
import type { Equipment } from "./AddEquipmentColumns";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { api } from "@/trpc/react";
import { Separator } from "./ui/separator";

interface EquipmentDataTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  setSelectedEquipments?: React.Dispatch<React.SetStateAction<Equipment[]>>;
}

export function EquipmentDataTable<TData, TValue>({
  data,
  columns,
  setSelectedEquipments,
}: EquipmentDataTableProps<TData, TValue>) {
  const [columnVisibility] = useState({
    categoryId: false,
    subCategoryId: false,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: categories } = api.equipment.getCategories.useQuery();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      rowSelection,
      sorting,
      columnVisibility,
    },
  });

  useEffect(() => {
    setSelectedEquipments &&
      setSelectedEquipments(
        table
          .getSelectedRowModel()
          .rows.map((row) => row.original as Equipment),
      );
  }, [rowSelection]);

  return (
    <div>
      <div className="flex items-center space-x-4">
        <Input
          placeholder="Look for Equipment..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
          onValueChange={(key) => {
            if (key === "A - Z") {
              setSorting([{ id: "name", desc: false }]);
            } else if (key === "Z - A") {
              setSorting([{ id: "name", desc: true }]);
            }
          }}
        >
          <SelectTrigger className="mr-4 w-1/4 min-w-44">
            <SelectValue placeholder="Sort Equipment Name" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sort Equipment Name</SelectLabel>
              <SelectItem key={"A - Z"} value={"A - Z"}>
                A - Z
              </SelectItem>
              <SelectItem key={"Z - A"} value={"Z - A"}>
                Z - A
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(key) => {
            if (key === "All") {
              table.getColumn("categoryId")?.setFilterValue("");
            } else {
              table.getColumn("categoryId")?.setFilterValue(key);
            }
          }}
        >
          <SelectTrigger className="mr-4  w-1/4 min-w-44">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filter by Category</SelectLabel>
              <SelectItem key={"All"} value={"All"}>
                All
              </SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          onValueChange={(key) => {
            if (key === "All") {
              table.getColumn("subCategoryId")?.setFilterValue("");
            } else {
              table.getColumn("subCategoryId")?.setFilterValue(key);
            }
          }}
        >
          <SelectTrigger className="mr-4  w-1/4 min-w-44">
            <SelectValue placeholder="Filter by Sub Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filter by Sub Category</SelectLabel>
              <SelectItem key={"All"} value={"All"}>
                All
              </SelectItem>
              <Separator className="h-0.5 bg-slate-500" />
              {categories?.map((category) => (
                <>
                  <SelectGroup key={category.name}>
                    <SelectLabel>{category.name}</SelectLabel>
                    {category.subCategory.map((subCategory) => (
                      <SelectItem key={subCategory.id} value={subCategory.id}>
                        {subCategory.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <Separator className="h-0.5 bg-slate-500" />
                </>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4 rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="default"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
