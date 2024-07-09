"use client";

import type { ColumnDef } from "@tanstack/react-table";
import SubCategoryDataTableRowActions from "./SubCategoryDataTableRowActions";

export type SubCategory = {
  id: string;
  name: string;
};

interface subCategoryColumnsProps {
  onEdit: (value: SubCategory) => void;
  onDelete: (value: SubCategory) => void;
}

export const subCategoryColumns = ({
  onDelete,
  onEdit,
}: subCategoryColumnsProps): ColumnDef<SubCategory>[] => [
  {
    accessorKey: "name",
    header: "Sub Category",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <SubCategoryDataTableRowActions
        row={row}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    ),
  },
];
