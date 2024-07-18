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
import { Skeleton } from "@/app/_components/ui/skeleton";
import { Checkbox } from "@/app/_components/ui/checkbox";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  allSemesters: { name: string }[];
  searchInput: string;
  debouncerIsLoading: boolean;
}

export function TrackLoansDataTable<TData, TValue>({
  columns,
  data,
  allSemesters,
  searchInput,
  debouncerIsLoading,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const loanStatus = [
    "PENDING_APPROVAL",
    "REJECTED",
    "REQUEST_COLLECTION",
    "PREPARING",
    "READY",
    "COLLECTED",
    "CANCELLED",
    "RETURNED",
    "PARTIAL_RETURN",
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    filterFns: {
      overdueFilter: (row, columnId, filterValue) => {
        return new Date(row.getValue("dueDate")) < new Date();
      },
    },

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
    <div className="mt-3">
      <div className="mb-2 flex items-center">
        <div>
          <p className="mr-3 text-sm font-medium">Semester</p>
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
        </div>
        <div>
          <p className="mr-3 text-sm font-medium">Status</p>
          <Select
            onValueChange={(key) => {
              if (key === "All") {
                table.getColumn("status")?.setFilterValue("");
              } else {
                table.getColumn("status")?.setFilterValue(key);
              }
            }}
          >
            <SelectTrigger className="mr-4  w-1/4 min-w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem key={"All"} value={"All"}>
                  All
                </SelectItem>
                {loanStatus.map((status) => (
                  <SelectItem key={status} value={status}>
                    {toStartCase(status)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {/* <div className="h-max ">
          <p className="text-sm font-medium">Overdue Loans</p>
          <div className="flex h-10 justify-center pt-2">
            <Checkbox
              onCheckedChange={(e) => {
    
              }}
              className="h-5 w-5"
            />
          </div>
        </div> */}
      </div>
      {searchInput === "" ? (
        <div>
          <div className="my-3 flex h-[100px] w-full items-center justify-center">
            <div>Search For Equipment</div>
          </div>
        </div>
      ) : debouncerIsLoading ? (
        <div>
          <div className="my-3 w-full">
            <Skeleton className="mb-3 h-7" />
            <Skeleton className="h-44" />
          </div>
        </div>
      ) : data === undefined ? (
        <div>Search Loans</div>
      ) : (
        <div>
          <div className="my-3 w-full ">
            <div className="rounded-lg border shadow-md">
              <Table>
                <TableHeader className="rounded-t-lg">
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
      )}
    </div>
  );
}

function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
