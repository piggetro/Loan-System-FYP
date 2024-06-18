"use client";

import type { ColumnDef } from "@tanstack/react-table";
import EquipmentDataTableRowActions from "./EquipmentDataTableRowActions";

export type Equipment = {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  inventoryCount: number;
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
    accessorKey: "inventoryCount",
    header: "Inventory Count",
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
];
