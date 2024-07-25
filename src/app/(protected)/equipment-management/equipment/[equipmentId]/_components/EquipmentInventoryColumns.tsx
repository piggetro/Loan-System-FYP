"use client";

import { ColumnDef } from "@tanstack/react-table";
import EquipmentInventoryDataTableRowActions from "./EquipmentInventoryDataTableRowActions";

export type EquipmentInventoryItem = {
  id: string;
  assetNumber: string;
  cost: string;
  status: string;
  datePurchased: Date | null;
  warrantyExpiry: Date | null;
};

interface EquipmentInventoryItemColumnProps {
  onDelete: (value: EquipmentInventoryItem) => void;
  onEdit: (value: EquipmentInventoryItem) => void;
}

export const equipmentInventoryItemColumns = ({
  onDelete,
  onEdit,
}: EquipmentInventoryItemColumnProps): ColumnDef<EquipmentInventoryItem>[] => [
  {
    accessorKey: "assetNumber",
    header: "Asset Number",
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: (props) => <span>${props.cell.getValue() as string}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (props) => (
      <div className="flex items-center">
        <div
          className={`mr-2 h-3 w-3 rounded-full ${
            props.cell.getValue() === "AVAILABLE"
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        ></div>
        <span>{toStartCase(props.cell.getValue() as string)}</span>
      </div>
    ),
  },
  {
    accessorKey: "datePurchased",
    header: "Date Purchased",
    cell: (props) => {
      const date = props.cell.getValue() as Date;
      return <span>{date?.toLocaleDateString("en-SG")}</span>;
    },
  },
  {
    accessorKey: "warrantyExpiry",
    header: "Warranty Expirary",
    cell: (props) => {
      const date = props.cell.getValue() as Date;
      return <span>{date?.toLocaleDateString("en-SG")}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <EquipmentInventoryDataTableRowActions
        row={row}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];

function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
