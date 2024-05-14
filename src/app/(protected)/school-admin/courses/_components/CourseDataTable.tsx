"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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
import { useState } from "react";
import { dataTagSymbol } from "@tanstack/react-query";

interface CourseDataTableProps<TData, TValue> {
    column: ColumnDef<TData,TValue>[];
    data:TData[];
}

export function CourseDataTable<TData, TValue>({
    column,
    data,
}: CourseDataTableProps<TData,TValue>)