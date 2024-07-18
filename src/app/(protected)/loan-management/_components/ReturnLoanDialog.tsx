import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import React, { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/app/_components/ui/use-toast";
import { Button } from "@/app/_components/ui/button";
import Image from "next/image";
import { Input } from "@/app/_components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Textarea } from "@/app/_components/ui/textarea";

type ReturnDataType = {
  equipmentId: string;
  loanItemId: string;
  description: string;
  checklist: string | undefined;
  assetNumber: string;
  returned: string;
  remarks: string | undefined;
  disabled: boolean;
};

const ReturnLoanDialog: React.FC<{
  closeDialog: () => void;
  id: string;
}> = ({ closeDialog, id }) => {
  const [isReturning, setIsReturning] = useState<boolean>(false);
  const { isFetching, data, isFetched, refetch } =
    api.loanRequest.getReadyLoanById.useQuery({
      id: id,
    });
  const processLoanCollection = api.loanRequest.processLoanReturn.useMutation();
  // const processedLoanData: ReturnDataType[] = [];
  const [processedLoanData, setProcessLoanData] = useState<ReturnDataType[]>(
    [],
  );
  const [returnedInventoryAssetNum, setReturnedInventoryAssetNum] =
    useState<string>("");
  const [returnedItemLength, setReturnedItemLength] = useState<number>(0);

  const { toast: collectionLoanToast } = useToast();

  useEffect(() => {
    data?.loanItems.forEach((loanItem) => {
      setProcessLoanData((prev) => [
        ...prev,
        {
          equipmentId: loanItem.equipment!.id ?? "",
          loanItemId: loanItem.id,
          description: loanItem.equipment!.name,
          checklist: loanItem.equipment!.checklist ?? "",
          assetNumber: loanItem.loanedInventory!.assetNumber,
          returned: loanItem.status!,
          remarks: loanItem.loanedInventory?.remarks ?? undefined,
          disabled:
            data?.status === "COLLECTED"
              ? false
              : loanItem.status! !== "COLLECTED"
                ? true
                : false,
        },
      ]);
    });
    setProcessLoanData((prev) => prev.slice(0, data?.loanItems.length));
  }, [data?.loanItems, isFetched]);

  useEffect(() => {
    const index = processedLoanData.findIndex(
      (loanData) => loanData.assetNumber === returnedInventoryAssetNum,
    );

    if (index !== -1) {
      setProcessLoanData((prevItems) => {
        const updatedItems = [...prevItems];
        updatedItems[index]!.returned = "Returned";
        return updatedItems;
      });

      setReturnedInventoryAssetNum("");
      setReturnedItemLength(returnedItemLength + 1);
    }
    let returnCount = 0;
    processedLoanData.forEach((loan) => {
      if (loan.returned !== "Not Returned") {
        returnCount++;
      }
    });
    setReturnedItemLength(returnCount);
  }, [processedLoanData, returnedInventoryAssetNum, returnedItemLength]);

  function onSubmit() {
    setIsReturning(true);
    processLoanCollection
      .mutateAsync({ id: id, loanItemsToReturn: processedLoanData })
      .then((results) => {
        refetch().catch(() => {
          collectionLoanToast({
            title: "An error occurred",
            description: "Please refresh page to see updated details",
          });
        });
        setIsReturning(false);
        collectionLoanToast({
          title: results.title,
          description: results.description,
          // @ts-expect-error ggg
          variant: results.variant,
        });
        if (results.variant != "destructive") {
          closeDialog();
        }
      })
      .catch(() => {
        setIsReturning(false);
        console.log("error");
      });
  }

  if (isFetching || !data) {
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
  console.log(processedLoanData);
  return (
    <div className="w-7/8 h-full overflow-y-scroll p-5">
      <div className="flex">
        <div className="flex w-1/2 flex-col">
          <div className="text-xl font-bold">{data.loanId}</div>
          <div className="mt-4 text-sm">
            <p className="flex">
              <span className="font-bold">Borrower:&nbsp;</span>
              {data.loanedBy === null ? "Deleted User" : data.loanedBy.name}
            </p>
            <p className="flex">
              <span className="font-bold">Approved By:&nbsp;</span>
              {data.approvedBy?.name ?? "-"}
            </p>
            <p className="flex">
              <span className="font-bold">Remark(s):&nbsp;</span> {data.remarks}
            </p>
            <p className="flex">
              <span className="font-bold">Prepared By:&nbsp;</span>
              {data.preparedBy?.name ?? "-"}
            </p>
            <p className="flex">
              <span className="font-bold">Issued By:&nbsp;</span>
              {data.issuedBy?.name ?? "-"}
            </p>
            <p className="flex">
              <span className="font-bold">Returned To:&nbsp;</span>
              {data.returnedTo?.name ?? "-"}
            </p>
            <p className="flex">
              <span className="font-bold">Loan Status:&nbsp;</span>{" "}
              <div className="flex items-center">
                <div
                  className={`mr-1 h-3 w-3 rounded-full ${
                    data.status === "COLLECTED" || data.status === "RETURNED"
                      ? "bg-green-500"
                      : data.status === "REJECTED" ||
                          data.status === "CANCELLED"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                  }`}
                ></div>
                <span>{toStartCase(data.status)}</span>
              </div>
            </p>
            <p className="flex" suppressHydrationWarning>
              <span className="font-bold">Due Date:&nbsp;</span>
              {new Date(data.dueDate) < new Date() ? (
                <p className="font-semibold text-red-500">
                  {new Date(data.dueDate).toLocaleDateString()}&nbsp;(Overdue)
                </p>
              ) : (
                <p> {new Date(data.dueDate).toLocaleDateString()}</p>
              )}
            </p>
          </div>
        </div>
        <div className="flex w-1/2 justify-end">
          <div
            onClick={() => {
              closeDialog();
            }}
          >
            <X></X>
          </div>
        </div>
      </div>

      <div className="mt-7">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Item Description</TableHead>
              <TableHead className="w-1/2">Checklist</TableHead>
              <TableHead className="w-1/6">Asset Number</TableHead>
              <TableHead>Returned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedLoanData.map((loanItem, index) => (
              <TableRow key={loanItem.equipmentId}>
                <TableCell className="font-medium">
                  {loanItem.description}
                </TableCell>
                <TableCell>{loanItem.checklist}</TableCell>
                <TableCell>{loanItem.assetNumber}</TableCell>
                <TableCell>
                  <Select
                    disabled={loanItem.disabled}
                    value={loanItem.returned}
                    onValueChange={(value) => {
                      setProcessLoanData((prevItems) => {
                        const updatedItems = [...prevItems];
                        updatedItems[index]!.returned = value;
                        return updatedItems;
                      });
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="COLLECTED">Not Returned</SelectItem>
                      <SelectItem value="RETURNED">Returned</SelectItem>
                      <SelectItem value="LOST">Lost</SelectItem>
                      <SelectItem value="DAMAGED">Damaged</SelectItem>
                      <SelectItem value="MISSING_CHECKLIST_ITEMS">
                        Penalty For Checklist
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex flex-col items-center">
        <p className="font-semibold">Returned Inventory Asset Number</p>
        <Input
          type="text"
          className="h-7 w-1/4"
          value={returnedInventoryAssetNum}
          onChange={(event) => {
            setReturnedInventoryAssetNum(event.target.value);
          }}
        />
      </div>
      <div className="mt-10 flex justify-center">
        <div className="flex flex-col items-center">
          <p className="font-semibold">Collection Reference Number</p>
          <p>{data.collectionReferenceNumber}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        <p className=" font-semibold">Loaner Signature</p>
        <div className=" overflow-hidden">
          {data.signature !== null ? (
            <Image
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              src={data.signature}
              width={400}
              height={200}
              alt="Loaner's Signature"
            />
          ) : null}
        </div>
      </div>
      <div className="mt-10 flex justify-center gap-3">
        <Button
          variant={"secondary"}
          className="bg-gray-300 hover:bg-gray-200"
          onClick={() => {
            closeDialog();
          }}
          type="button"
        >
          Close
        </Button>

        <Button
          onClick={() => {
            onSubmit();
          }}
        >
          {isReturning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Process Return
        </Button>
      </div>
    </div>
  );
};
function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default ReturnLoanDialog;
