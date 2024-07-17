"use client";

import { ColumnDef } from "@tanstack/react-table";
import AddEquipmentDataTableRowActions from "./AddEquipmentDataTableRowActions";

export type Equipment = {
  id: string;
  name: string;
  category: string | null;
  subCategory: string | null;
  categoryId: string | null;
  subCategoryId: string | null;
};

interface EquipmentColumnProps {
  onDelete: (value: Equipment) => void;
}

export const equipmentColumns = ({
  onDelete,
}: EquipmentColumnProps): ColumnDef<Equipment>[] => [
  {
    accessorKey: "name",
    header: "Equipment Name",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "subCategory",
    header: "Sub Category",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <AddEquipmentDataTableRowActions row={row} onDelete={onDelete} />
    ),
  },
  {
    accessorKey: "categoryId",
  },
  {
    accessorKey: "subCategoryId",
  },
];
