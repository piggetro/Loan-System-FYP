import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useToast } from "@/app/_components/ui/use-toast";
import { Button } from "@/app/_components/ui/button";
import { LoanedItemsStatus } from "@/db/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Input } from "@/app/_components/ui/input";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { api } from "@/trpc/react";

type CollectionDataType = {
  equipmentId: string;
  loanItemId: string;
  description: string;
  checklist: string | undefined;
  assetNumber: string;
};
export type OutstandingItems = {
  id: string;
  loanId: string;
  status: LoanedItemsStatus | null;
  equipmentId: string | null;
  inventoryId: string | null;
  waiverId: string | null;
  name: string | null;
  checklist: string | null;
  remarks: string | null;
  assetNumber: string | null;
};
type ProcessedOutstandingItems = {
  id: string;
  loanId: string;
  status: string;
  equipmentId: string;
  inventoryId: string;
  waiverId: string | null;
  name: string;
  checklist: string | null;
  remarks: string;
  assetNumber: string | null;
  edited: boolean;
  locked: boolean;
};
const OutstandingItemDialog: React.FC<{
  outstandingItems: OutstandingItems[];
  id: string;
  loanId: string;
  refresh: () => void;
}> = ({ id, outstandingItems, loanId, refresh }) => {
  const [enableSubmit, setEnableSubmit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processedOutstandingItems, setProcessedOutstandingItems] =
    useState<ProcessedOutstandingItems[]>();

  const updateOutstandingItems =
    api.loanRequest.processOutstandingLoanItem.useMutation();
  function onSubmit() {
    setIsLoading(true);
    updateOutstandingItems
      .mutateAsync(processedOutstandingItems!)
      .then(() => {
        toast({
          title: "Outstanding Items successfully updated",
          description: "Inventory has been updated",
        });
        setEnableSubmit(false);
        setIsLoading(false);
        refresh();
      })
      .catch((error: string) => {
        toast({ title: "An unexpected error occurred", description: error });
        setEnableSubmit(false);
        setIsLoading(false);
      });
  }
  const { toast } = useToast();
  useEffect(() => {
    setProcessedOutstandingItems(
      outstandingItems.map((item) => {
        return {
          ...item,
          edited: false,
          status: item.status!,
          name: item.name!,
          equipmentId: item.equipmentId!,
          inventoryId: item.inventoryId!,
          remarks: item.remarks!,
          locked: item.status === "RETURNED" ? true : false,
        };
      }),
    );
  }, [outstandingItems]);

  if (!processedOutstandingItems || processedOutstandingItems === undefined) {
    return (
      <div className="w-7/8 h-full p-5 ">
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="mt-4 h-5 w-96" />
        <Skeleton className="mt-2 h-5 w-96" />
        <Skeleton className="mt-2 h-5 w-96" />
        <Skeleton className="mt-2 h-5 w-96" />
        <Skeleton className="mt-5 h-96 w-full" />
      </div>
    );
  }
  return (
    <div className="w-7/8 h-full overflow-y-scroll p-5">
      <div className="flex">
        <div className="flex w-1/2 flex-col">
          <div className="text-xl font-bold">{loanId}</div>
          <div className="text-lg font-bold">Outstanding Items</div>
        </div>
      </div>

      <div className="mt-7 rounded-lg shadow-lg">
        <Table className="rounded-lg  shadow-lg">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/6">Item Description</TableHead>
              <TableHead className="w-1/3">Checklist</TableHead>
              <TableHead className="w-1/8">Asset Number</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Returned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedOutstandingItems.map((item, index) => (
              <TableRow key={item.equipmentId}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.checklist}</TableCell>
                <TableCell>{item.assetNumber}</TableCell>
                <TableHead>
                  <Input
                    disabled={item.locked}
                    onChange={(event) => {
                      setEnableSubmit(true);
                      setProcessedOutstandingItems((prevItems) => {
                        const updatedItems = [...processedOutstandingItems];
                        updatedItems[index]!.remarks = event.target.value;
                        updatedItems[index]!.edited = true;
                        return updatedItems;
                      });
                    }}
                    value={item.remarks}
                  />
                </TableHead>
                <TableCell>
                  <Select
                    disabled={item.locked}
                    value={item.status}
                    onValueChange={(value) => {
                      setProcessedOutstandingItems(() => {
                        const updatedItems = [...processedOutstandingItems];
                        updatedItems[index]!.status = value;
                        updatedItems[index]!.edited = true;
                        return updatedItems;
                      });
                      setEnableSubmit(true);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="RETURNED">Returned</SelectItem>
                      <SelectItem value="LOST">Lost</SelectItem>
                      <SelectItem value="DAMAGED">Damaged</SelectItem>
                      <SelectItem value="MISSING_CHECKLIST_ITEMS">
                        Penalty For Checklist
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                {/* <TableCell
            className={
              loanItem.returned === "MISSING_CHECKLIST_ITEMS"
                ? ""
                : "hidden"
            }
          >
            <Textarea
              disabled={loanItem.disabled}
              value={loanItem.remarks}
              onChange={(e) => {
                setProcessLoanData((prevItems) => {
                  const updatedItems = [...prevItems];
                  updatedItems[index]!.remarks = e.target.value;
                  return updatedItems;
                });
              }}
              className="w-48"
            />
          </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-10 flex justify-center gap-3">
        <Button
          onClick={() => {
            onSubmit();
          }}
          disabled={!enableSubmit || isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Changes
        </Button>
      </div>
    </div>
  );
};

export default OutstandingItemDialog;
