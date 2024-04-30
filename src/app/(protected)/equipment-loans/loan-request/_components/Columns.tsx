import { Button } from "@/app/_components/ui/button";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Trash, Trash2 } from "lucide-react";

export type Inventory = {
  itemDescription: string;
  category: string;
  subCategory: string;
  quantityAvailable: number;
};

export const equipmentColumns: ColumnDef<Inventory>[] = [
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
    header: ({ column }) => {
      return <p>Sub Category</p>;
    },
    cell: ({ row }) => <div className="">{row.getValue("subCategory")}</div>,
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-center">Quantity</div>,
    cell: ({ row }) => {
      const quantityAvailable = row.getValue("quantityAvailable");

      return (
        <div className="flex h-6 justify-center text-center font-medium text-gray-500">
          <div className="flex w-5 items-center justify-center rounded-l-md bg-gray-200 hover:cursor-pointer hover:bg-gray-300">
            -
          </div>
          <div className="flex w-8 items-center justify-center border-l-2 border-r-2 border-gray-300 bg-gray-200 text-center">
            1
          </div>
          <div className="flex w-5 items-center justify-center rounded-r-md bg-gray-200 text-center hover:cursor-pointer hover:bg-gray-300">
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
          <Button className="h-7">Add Item</Button>
        </div>
      );
    },
  },
];

export const summaryColumns: ColumnDef<Inventory>[] = [
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
    header: ({ column }) => {
      return <p>Sub Category</p>;
    },
    cell: ({ row }) => <div className="">{row.getValue("subCategory")}</div>,
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-center">Quantity</div>,
    cell: ({ row }) => {
      const quantityAvailable = row.getValue("quantityAvailable");

      return (
        <div className="flex h-6 justify-center text-center font-medium text-gray-500">
          <div className="flex w-5 items-center justify-center rounded-l-md bg-gray-200 hover:cursor-pointer hover:bg-gray-300">
            -
          </div>
          <div className="flex w-8 items-center justify-center border-l-2 border-r-2 border-gray-300 bg-gray-200 text-center">
            1
          </div>
          <div className="flex w-5 items-center justify-center rounded-r-md bg-gray-200 text-center hover:cursor-pointer hover:bg-gray-300">
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
          <div className="">
            <Trash2 className="h-5 w-5  text-black hover:cursor-pointer hover:text-primary" />
          </div>
        </div>
      );
    },
  },
];
