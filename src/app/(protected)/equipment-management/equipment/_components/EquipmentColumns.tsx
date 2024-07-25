"use client";

import type { ColumnDef } from "@tanstack/react-table";
import EquipmentDataTableRowActions from "./EquipmentDataTableRowActions";

export type Equipment = {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  totalCount: number;
  availableCount: number;
  unavailableCount: number;
  subCategoryId: string;
  categoryId: string;
  photoPath: string;
};

interface equipmentColumnsProps {
  onView: (value: Equipment) => void;
  onDelete: (value: Equipment) => void;
}

export const equipmentColumns = ({
  onDelete,
  onView,
}: equipmentColumnsProps): ColumnDef<Equipment>[] => [
  {
    accessorKey: "name",
    header: "Equipment",
    cell: ({ row }) => (
      <div className="flex items-center">
        <img
          src={"/api/uploads/" + row.original.photoPath}
          alt={row.original.name}
          className="h-10 w-10"
        />
        <span className="ml-2">{row.original.name}</span>
      </div>
    ),
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
    accessorKey: "totalCount",
    header: "Total Count",
  },
  {
    accessorKey: "availableCount",
    header: "Available Count",
  },
  {
    accessorKey: "unavailableCount",
    header: "Unavailable Count",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <EquipmentDataTableRowActions
        row={row}
        onView={onView}
        onDelete={onDelete}
      />
    ),
  },
  {
    accessorKey: "categoryId",
  },
  {
    accessorKey: "subCategoryId",
  },
];
