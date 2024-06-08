"use client";

import { ColumnDef } from "@tanstack/react-table";
import AddEquipmentDataTableRowActions from "./AddEquipmentDataTableRowActions";

export type Equipment = {
  id: string;
  name: string;
};

interface EquipmentColumnProps {
  onDelete: (value: Equipment) => void;
}

export const equipmentColumns = ({ onDelete }: EquipmentColumnProps): ColumnDef<Equipment>[] => [
  {
    accessorKey: "name",
    header: "Equipment Name",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <AddEquipmentDataTableRowActions row={row} onDelete={onDelete} />
    ),
  },
];
