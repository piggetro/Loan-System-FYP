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
import { type LoanedItemsStatus } from "@/db/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { api } from "@/trpc/react";
import { Textarea } from "@/app/_components/ui/textarea";

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
}> = ({ outstandingItems, loanId, refresh }) => {
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
      .catch(() => {
        toast({
          title: "An unexpected error occured. Please try again later",
          variant: "destructive",
        });
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

  function markAllAsReturned() {
    setProcessedOutstandingItems(() => {
      const updatedItems: ProcessedOutstandingItems[] = [];
      processedOutstandingItems?.forEach((item) => {
        updatedItems.push({
          ...item,
          status: "RETURNED",
          remarks: "",
          edited: true,
        });
      });
      setEnableSubmit(true);
      return updatedItems;
    });
  }

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
      <div className="mb-3 flex">
        <div className="flex w-1/2 flex-col">
          <div className="text-xl font-bold">{loanId}</div>
          <div className="text-lg font-bold">Outstanding Items</div>
        </div>
        <div className="flex w-1/2 items-end justify-end">
          <Button
            disabled={
              processedOutstandingItems.findIndex(
                (item) => item.locked === false,
              ) === -1
                ? true
                : false
            }
            onClick={markAllAsReturned}
          >
            Mark All As Returned
          </Button>
        </div>
      </div>

      <div className=" rounded-lg shadow-lg">
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
                  <Textarea
                    disabled={item.locked}
                    onChange={(event) => {
                      setEnableSubmit(true);
                      setProcessedOutstandingItems(() => {
                        const updatedItems = [...processedOutstandingItems];
                        updatedItems[index]!.remarks = event.target.value;
                        updatedItems[index]!.edited = true;
                        return updatedItems;
                      });
                    }}
                    className="my-2 h-7"
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
                        if (value === "RETURNED") {
                          updatedItems[index]!.remarks = "";
                        }
                        return updatedItems;
                      });
                      setEnableSubmit(true);
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="RETURNED">
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-3 w-3 rounded-full bg-green-500`}
                          ></div>
                          Returned
                        </div>
                      </SelectItem>
                      <SelectItem value="LOST">
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-3 w-3 rounded-full bg-red-500`}
                          ></div>
                          Lost
                        </div>
                      </SelectItem>
                      <SelectItem value="DAMAGED">
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-3 w-3 rounded-full bg-red-500`}
                          ></div>
                          Damaged
                        </div>
                      </SelectItem>
                      <SelectItem value="MISSING_CHECKLIST_ITEMS">
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-3 w-3 rounded-full bg-red-500`}
                          ></div>
                          Penalty For Checklist
                        </div>
                      </SelectItem>
                      <SelectItem value="UNAVAILABLE">
                        <div className="flex items-center">
                          <div
                            className={`mr-2 min-h-3 min-w-3 rounded-full bg-yellow-500`}
                          ></div>
                          <div className="truncate">
                            Returned (Mark Inventory As Unavailable)
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
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
