"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/app/_components/ui/checkbox";

export type AccessRights = {
  id: string;
  pageName: string;
  pageLink: string;
};

export const accessRightColumns = (): ColumnDef<AccessRights>[] => [
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
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "pageName",
    header: "Page Name",
  },
  {
    accessorKey: "pageLink",
    header: "Page Link",
  },
];
