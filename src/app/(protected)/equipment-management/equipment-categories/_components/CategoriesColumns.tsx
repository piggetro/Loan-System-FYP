"use client";

import type { ColumnDef } from "@tanstack/react-table";
import CategoriesDataTableRowActions from "./CategoriesDataTableRowActions";

export type Category = {
  id: string;
  name: string;
};

interface categoryColumnsProps {
  onView: (value: Category) => void;
  onDelete: (value: Category) => void;
}

export const categoryColumns = ({
  onView,
  onDelete,
}: categoryColumnsProps): ColumnDef<Category>[] => [
  {
    accessorKey: "name",
    header: "Category",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CategoriesDataTableRowActions
        row={row}
        onView={onView}
        onDelete={onDelete}
      />
    ),
  },
];
