"use client";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

import React from "react";
import { EquipmentDataTable, SummaryDataTable } from "./DataTable";
import { equipmentColumns, summaryColumns } from "./Columns";
import { type Inventory } from "./Columns";

//TO DO: Replace with real data
const inventoryData: Inventory[] = [
  {
    itemDescription: "Xbox One",
    category: "Gaming",
    subCategory: "Gaming Console",

    quantityAvailable: 2,
  },
  {
    itemDescription: "Xbox One Controller",
    category: "Gaming",
    subCategory: "Gaming Controller",
    quantityAvailable: 2,
  },
];

const summaryData: Inventory[] = [
  {
    itemDescription: "Iphone 15 512gb",
    category: "Phone",
    subCategory: "Smart Phone",
    quantityAvailable: 2,
  },
];

const LoanRequestComponent = () => {
  return (
    <div className="">
      <div className="w-full rounded-lg bg-white px-5 py-3 shadow-md">
        <h1 className="font-semibold">Loan Details</h1>
        <div className="mt-3 flex">
          <div className="flex w-1/2 flex-col gap-3">
            <div className="flex items-center">
              <div className="w-1/2 max-w-52">
                <Label>Remarks</Label>
              </div>
              <div className="w-1/2 ">
                <Input className="h-7" />
              </div>
            </div>
            <div className="flex">
              <div className="w-1/2 max-w-52">
                <Label>Approving Lecturer</Label>
              </div>
              <div className="w-1/2">
                <Input className="h-7" />
              </div>
            </div>
          </div>
          <div className="flex w-1/2 justify-end">
            <div className="flex w-3/5">
              <div className="flex h-7 items-center">
                <Label className=" h-fit w-28">Return Date</Label>
              </div>

              <Input className="h-7 " type="date" />
            </div>
          </div>
        </div>
      </div>
      <div className="my-3 w-full rounded-lg bg-white px-5 py-2 shadow-md">
        <h1 className="font-semibold">Search For Item</h1>
        <div className="my-2 flex gap-3">
          <Input placeholder="Search" className="h-7" />
          <Select>
            <SelectTrigger className="h-7 w-1/4  min-w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Category</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="h-7 w-1/4 min-w-44">
              <SelectValue placeholder="Sub-Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
                <SelectItem value="pineapple">Pineapple</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button className="h-7">Search</Button>
        </div>

        {/* TABLE IS HERE */}
        <div className="my-3 w-full ">
          <div className="rounded-md border">
            <EquipmentDataTable
              data={inventoryData}
              columns={equipmentColumns}
            />
          </div>
        </div>
      </div>
      {/* 
      Summary is here */}

      <div className="mb-3 w-full rounded-lg bg-white px-5 py-3 shadow-md">
        <h1 className="font-semibold">Summary of Selected Items</h1>
        <div className="my-3 w-full ">
          <div className="rounded-md border">
            <SummaryDataTable data={summaryData} columns={summaryColumns} />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button className="h-8 w-28">Next</Button>
      </div>
    </div>
  );
};

export default LoanRequestComponent;
