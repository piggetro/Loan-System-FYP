"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/app/_components/ui/checkbox";

export type Equipment = {
  id: string;
  name: string;
};

export const equipmentColumns = (): ColumnDef<Equipment>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Equipment Name",
  },
];
