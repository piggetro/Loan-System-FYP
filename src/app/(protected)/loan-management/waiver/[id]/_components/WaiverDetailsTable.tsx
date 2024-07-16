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
import {
  type WaiveRequestStatus,
  type LoanStatus,
  LoanedItemsStatus,
} from "@/db/enums";
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
  loanId: string;
  status: LoanedItemsStatus | null;
  equipmentId: string | null;
  inventoryId: string | null;
  waiverId: string | null;
  name: string | null;
  checklist: string | null;
  remarks: string | null;
  cost: number | null;
};

const LoanDetailsTable: React.FC<{
  outstandingItems: WaiverItemDataType[];
}> = ({ outstandingItems }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/4">Item Description</TableHead>
          <TableHead className="w-1/4">Checklist</TableHead>

          <TableHead>Remarks</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {outstandingItems.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>{item.checklist}</TableCell>

            <TableCell>{item.remarks}</TableCell>
            <TableCell>$&nbsp;{item.cost ?? "-"}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <div
                  className={`mr-2 h-3 w-3 rounded-full ${
                    item.status === "RETURNED"
                      ? "bg-green-500"
                      : item.status === "DAMAGED"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                  }`}
                ></div>
                <p> {toStartCase(item.status!)}</p>
              </div>
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
