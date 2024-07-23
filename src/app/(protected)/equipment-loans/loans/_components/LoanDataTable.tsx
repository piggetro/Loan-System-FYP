"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { useState } from "react";
import React from "react";
import { Input } from "@/app/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Button } from "@/app/_components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  allSemesters: { name: string }[];
  filterOptions: "collectionReq" | "prepCollect" | null;
}

export function DefaultLoanDataTable<TData, TValue>({
  columns,
  data,
  allSemesters,
  filterOptions,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,

    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
  });

  return (
    <div>
      <h1 className="mb-3 font-semibold">Search For Loan</h1>
      <div className="mb-2 flex">
        <Select
          onValueChange={(key) => {
            if (key === "All") {
              table.getColumn("loanId")?.setFilterValue("");
            } else {
              table.getColumn("loanId")?.setFilterValue(key);
            }
          }}
        >
          <SelectTrigger className="mr-4  w-1/4 min-w-44">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Semester</SelectLabel>
              <SelectItem key={"All"} value={"All"}>
                All
              </SelectItem>
              {allSemesters.map((semester) => (
                <SelectItem key={semester.name} value={semester.name}>
                  {semester.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {filterOptions === "collectionReq" ? (
          <Select
            onValueChange={(key) => {
              if (key === "All") {
                table.getColumn("status")?.setFilterValue("");
              } else {
                table.getColumn("status")?.setFilterValue(key);
              }
            }}
          >
            <SelectTrigger className=" w-1/4  min-w-44">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem key={"All"} value={"All"}>
                  All
                </SelectItem>
                <SelectItem
                  key={"REQUEST_COLLECTION"}
                  value={"REQUEST_COLLECTION"}
                >
                  REQUEST_COLLECTION
                </SelectItem>
                <SelectItem key={"APPROVED"} value={"APPROVED"}>
                  APPROVED
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : null}
        {filterOptions === "prepCollect" ? (
          <Select
            onValueChange={(key) => {
              if (key === "All") {
                table.getColumn("status")?.setFilterValue("");
              } else {
                table.getColumn("status")?.setFilterValue(key);
              }
            }}
          >
            <SelectTrigger className=" w-1/4  min-w-44">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem key={"All"} value={"All"}>
                  All
                </SelectItem>
                <SelectItem key={"PREPARING"} value={"PREPARING"}>
                  PREPARING
                </SelectItem>
                <SelectItem key={"READY"} value={"READY"}>
                  READY
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : null}
      </div>

      <div className="my-3 w-full ">
        <div className="rounded-md border">
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
                    className="p-0"
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
                    No Loans Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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
