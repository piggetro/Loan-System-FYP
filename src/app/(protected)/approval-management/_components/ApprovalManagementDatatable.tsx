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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function ApprovalManagementTable<TData, TValue>({
  columns,
  data,
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
  });

  return (
    <div>
      <h1 className="font-semibold">Search For Item</h1>
      {/* <div className="my-2 flex gap-3">
        <Input
          placeholder="Search"
          className="h-7"
          value={
            (table.getColumn("itemDescription")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("itemDescription")
              ?.setFilterValue(event.target.value)
          }
        />
        <Select
          onValueChange={(key) => {
            if (key === "All") {
              setSelectedCategoryId("");
              table.getColumn("category")?.setFilterValue("");
            } else {
              setSelectedCategoryId(key);
              table
                .getColumn("category")
                ?.setFilterValue(
                  categoriesAndSubCategories.categories.at(parseInt(key) - 1)
                    ?.name,
                );
            }
          }}
        >
          <SelectTrigger className="h-7 w-1/4  min-w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              <SelectItem key={"All"} value={"All"}>
                All
              </SelectItem>
              {categoriesAndSubCategories.categories.map((category) => (
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
              setSelectedCategoryId("");
              table.getColumn("subCategory")?.setFilterValue("");
            } else {
              setSelectedCategoryId(key);
              table.getColumn("subCategory")?.setFilterValue(key);
            }
          }}
        >
          <SelectTrigger className="h-7 w-1/4 min-w-44">
            <SelectValue placeholder="Sub-Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sub Category</SelectLabel>
              <SelectItem key={"All"} value={"All"}>
                All
              </SelectItem>
              {categoriesAndSubCategories.subCategories.map((subCategory) =>
                selectedCategoryId == subCategory.categoryId ? (
                  <SelectItem key={subCategory.name} value={subCategory.name}>
                    {subCategory.name}
                  </SelectItem>
                ) : null,
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div> */}
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
                    No Active Loan Requests
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
export function ApprovalManagementHistoryTable<TData, TValue>({
  columns,
  data,
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
  });

  return (
    <div>
      <h1 className="font-semibold">Search For Item</h1>
      {/* <div className="my-2 flex gap-3">
        <Input
          placeholder="Search"
          className="h-7"
          value={
            (table.getColumn("itemDescription")?.getFilterValue() as string) ??
            ""
          }
          onChange={(event) =>
            table
              .getColumn("itemDescription")
              ?.setFilterValue(event.target.value)
          }
        />
        <Select
          onValueChange={(key) => {
            if (key === "All") {
              setSelectedCategoryId("");
              table.getColumn("category")?.setFilterValue("");
            } else {
              setSelectedCategoryId(key);
              table
                .getColumn("category")
                ?.setFilterValue(
                  categoriesAndSubCategories.categories.at(parseInt(key) - 1)
                    ?.name,
                );
            }
          }}
        >
          <SelectTrigger className="h-7 w-1/4  min-w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              <SelectItem key={"All"} value={"All"}>
                All
              </SelectItem>
              {categoriesAndSubCategories.categories.map((category) => (
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
              setSelectedCategoryId("");
              table.getColumn("subCategory")?.setFilterValue("");
            } else {
              setSelectedCategoryId(key);
              table.getColumn("subCategory")?.setFilterValue(key);
            }
          }}
        >
          <SelectTrigger className="h-7 w-1/4 min-w-44">
            <SelectValue placeholder="Sub-Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sub Category</SelectLabel>
              <SelectItem key={"All"} value={"All"}>
                All
              </SelectItem>
              {categoriesAndSubCategories.subCategories.map((subCategory) =>
                selectedCategoryId == subCategory.categoryId ? (
                  <SelectItem key={subCategory.name} value={subCategory.name}>
                    {subCategory.name}
                  </SelectItem>
                ) : null,
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div> */}
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
                    No Active Loan Requests
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
