/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Button } from "@/app/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { useToast } from "@/app/_components/ui/use-toast";
import { type WaiveRequestStatus, type LoanStatus } from "@/db/enums";
import { api } from "@/trpc/react";

import { MoreHorizontal } from "lucide-react";
import { useCallback } from "react";

export interface EquipmentDetailsData {
  id: string;
  name: string;
  photoPath: string | null;
  updatedAt: Date | null;
  subCategoryId: string | null;
  checklist: string | null;
  status: string | null;
}

export interface LoanDetailsData {
  id: string;
  loanId: string;
  remarks: string;
  dueDate: Date;
  status: LoanStatus;
  signature: string | null;
  loanedById: string | null;
  approvedById: string | null;
  preparedById: string | null;
  issuedById: string | null;
  returnedToId: string | null;
  approvingLecturerId: string | null;
  dateCreated: Date;
  collectionReferenceNumber: string | null;
  datePrepared: Date | null;
  dateIssued: Date | null;
  dateCollected: Date | null;
  dateReturned: Date | null;
  loanedByName: string | null;
  approvedByName: string | null;
  preparedByName: string | null;
  issuedByName: string | null;
  returnedToName: string | null;
  loanItems: EquipmentDetailsData[];
}

type WaiverItemDataType = {
  id: string;
  status: WaiveRequestStatus;
  remarks: string | null;
  loanId: string;
  dateIssued: Date;
  reason: string | null;
  approvedByUserId: string | null;
  loanItemId: string;
  equipment_name: string | null;
  equipment_checklist: string | null;
};

const LoanDetailsTable: React.FC<{
  outstandingItems: WaiverItemDataType[];
  refresh: () => void;
}> = ({ outstandingItems, refresh }) => {
  const processedWaiverData: WaiverItemDataType[] = [];
  outstandingItems.forEach((item) => {
    const tempWaiverItemObject: WaiverItemDataType = {
      id: item.id,
      loanId: item.loanId,
      status: item.status,
      approvedByUserId: item.approvedByUserId,
      loanItemId: item.loanItemId,
      reason: item.reason,
      remarks: item.remarks,
      dateIssued: item.dateIssued,
      equipment_name: item.equipment_name,
      equipment_checklist: item.equipment_checklist,
    };

    processedWaiverData.push(tempWaiverItemObject);
  });
  const { toast } = useToast();
  const approveWaiver = api.waiver.approveWaiver.useMutation();
  const rejectLoan = api.waiver.rejectWaiver.useMutation();

  const onApprove = useCallback((id: string) => {
    approveWaiver
      .mutateAsync({ id: id })
      .then(() => {
        toast({ title: "Successfully Approved Waive Request" });
        refresh();
      })
      .catch((error) => {
        toast({ title: "An Error Occured", description: error });
      });
  }, []);
  const onReject = useCallback((id: string) => {
    rejectLoan
      .mutateAsync({ id: id })
      .then(() => {
        toast({ title: "Successfully Rejected Waive Request" });
        refresh();
      })
      .catch((error) => {
        toast({ title: "An Error Occured", description: error });
      });
  }, []);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/4">Item Description</TableHead>
          <TableHead className="w-1/4">Checklist</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Remarks</TableHead>
          <TableHead>Waive Request</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {processedWaiverData.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.equipment_name}</TableCell>
            <TableCell>{item.equipment_checklist}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <div
                  className={`mr-2 h-3 w-3 rounded-full ${
                    item.status === "APPROVED"
                      ? "bg-green-500"
                      : item.status === "REJECTED"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                  }`}
                ></div>
                <p> {toStartCase(item.status)}</p>
              </div>
            </TableCell>
            <TableCell>{item.remarks}</TableCell>
            <TableCell>{item.reason}</TableCell>
            <TableCell className={item.status === "APPROVED" ? "hidden" : ""}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>

                  <DropdownMenuItem
                    onClick={() => {
                      onApprove(item.id);
                    }}
                    className=""
                  >
                    Approve Waiver
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      onReject(item.id);
                    }}
                    className="text-red-500 focus:bg-red-100 focus:text-red-500"
                  >
                    Reject Waiver
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
function toStartCase(string: string) {
  return string
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default LoanDetailsTable;
