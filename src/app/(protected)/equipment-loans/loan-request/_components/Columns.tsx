/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import { Button } from "@/app/_components/ui/button";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { useState } from "react";
import { type Inventory } from "../page";

export const equipmentColumns = (
  setAddedEquipment: (ItemToAdd: Inventory) => void,
): ColumnDef<Inventory>[] => [
  {
    accessorKey: "itemDescription",
    header: "Item Description",
    cell: ({ row }) => (
      <div className="w-96">{row.getValue("itemDescription")}</div>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="">{row.getValue("category")}</div>,
  },
  {
    accessorKey: "subCategory",
    header: () => {
      return <p>Sub Category</p>;
    },
    cell: ({ row }) => <div className="">{row.getValue("subCategory")}</div>,
  },
  {
    accessorKey: "quantitySelected",
    header: () => <div className="text-center">Quantity</div>,
    cell: ({ row }) => {
      const [value, setValue] = useState<number>(row.original.quantitySelected);
      return (
        <div className="flex h-6 justify-center text-center font-medium text-gray-500">
          <div
            className="flex w-5 items-center justify-center rounded-l-md bg-gray-200 hover:cursor-pointer hover:bg-gray-300"
            onClick={() => {
              if (value > 1) {
                setValue(value - 1);
                row.original.quantitySelected = value - 1;
              }
            }}
          >
            -
          </div>
          <div className="flex w-8 items-center justify-center border-l-2 border-r-2 border-gray-300 bg-gray-200 text-center">
            {value}
          </div>
          <div
            className="flex w-5 items-center justify-center rounded-r-md bg-gray-200 text-center hover:cursor-pointer hover:bg-gray-300"
            onClick={() => {
              if (value < row.original.quantityAvailable) {
                setValue(value + 1);
                row.original.quantitySelected = value + 1;
              }
            }}
          >
            +
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "addItem",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setAddedEquipment(row.original);
            }}
          >
            Add Item
          </Button>
        </div>
      );
    },
  },
];

export const summaryColumns = (
  removeItem: (itemIndex: number) => void,
  adjustQuantity: (equipmentData: Inventory) => void,
): ColumnDef<Inventory>[] => [
  {
    accessorKey: "itemDescription",
    header: "Item Description",
    cell: ({ row }) => (
      <div className="w-96">{row.getValue("itemDescription")}</div>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="pl-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="">{row.getValue("category")}</div>,
  },
  {
    accessorKey: "subCategory",
    header: () => {
      return <p>Sub Category</p>;
    },
    cell: ({ row }) => <div className="">{row.getValue("subCategory")}</div>,
  },
  {
    accessorKey: "quantityAvailable",
    header: () => <div className="text-center">Quantity</div>,
    cell: ({ row }) => {
      // const quantityAvailable = row.getValue("quantityAvailable");
      const [value, setValue] = useState<number>(row.original.quantitySelected);

      return (
        <div className="flex h-6 justify-center text-center font-medium text-gray-500">
          <div
            className="flex w-5 items-center justify-center rounded-l-md bg-gray-200 hover:cursor-pointer hover:bg-gray-300"
            onClick={() => {
              if (value > 1) {
                setValue(value - 1);
                row.original.quantitySelected = value - 1;
                adjustQuantity(row.original);
              }
            }}
          >
            -
          </div>
          <div className="flex w-8 items-center justify-center border-l-2 border-r-2 border-gray-300 bg-gray-200 text-center">
            {value}
          </div>
          <div
            className="flex w-5 items-center justify-center rounded-r-md bg-gray-200 text-center hover:cursor-pointer hover:bg-gray-300"
            onClick={() => {
              if (value < row.original.quantityAvailable) {
                setValue(value + 1);
                row.original.quantitySelected = value + 1;
                adjustQuantity(row.original);
              }
            }}
          >
            +
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "deleteItem",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <div
            className=""
            onClick={() => {
              console.log(row.index);
              removeItem(row.index);
            }}
          >
            <Trash2 className="h-5 w-5  text-black hover:cursor-pointer hover:text-primary" />
          </div>
        </div>
      );
    },
  },
];
