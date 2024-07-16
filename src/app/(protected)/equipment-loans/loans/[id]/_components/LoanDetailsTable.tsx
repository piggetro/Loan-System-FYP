/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { LoanedItemsStatus, type LoanStatus } from "@/db/enums";

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
  approverId: string | null;
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
  approverName: string | null;
  loanItems: EquipmentDetailsData[];
  outstandingItems: {
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
  }[];
}

type EquipmentDataType = {
  id: string;
  description: string;
  checklist: string | null;
  quantityRequested: number;
  quantityApproved: number;
  quantityPrepared: number;
  quantityCollected: number;
  quantityReturned: number;
};

const LoanDetailsTable: React.FC<{
  loanData: LoanDetailsData;
  outstandingItems: boolean;
}> = ({ loanData, outstandingItems }) => {
  const processedLoanData: EquipmentDataType[] = [];
  loanData.loanItems.forEach((equipment) => {
    const index = processedLoanData.findIndex(
      (equipmentInArr) => equipmentInArr.id === equipment.id,
    );

    if (index === -1) {
      const tempEquipmentObject: EquipmentDataType = {
        id: equipment.id,
        description: equipment.name,
        checklist: equipment.checklist,
        quantityRequested: 1,
        quantityApproved: 0,
        quantityPrepared: 0,
        quantityCollected: 0,
        quantityReturned: 0,
      };

      if (loanData.approvedById !== null && loanData.status !== "REJECTED") {
        tempEquipmentObject.quantityApproved = 1;
      }
      if (loanData.preparedById !== null) {
        tempEquipmentObject.quantityPrepared = 1;
      }
      if (loanData.issuedById !== null) {
        tempEquipmentObject.quantityCollected = 1;
      }
      if (equipment.status === "RETURNED") {
        tempEquipmentObject.quantityReturned = 1;
      }
      processedLoanData.push(tempEquipmentObject);
    } else {
      if (processedLoanData[index] != undefined) {
        processedLoanData[index]!.quantityRequested =
          processedLoanData[index]!.quantityRequested + 1;
        if (loanData.approvedById != null && loanData.status !== "REJECTED") {
          processedLoanData[index]!.quantityApproved =
            processedLoanData[index]!.quantityApproved + 1;
        }
        if (loanData.preparedById != null) {
          processedLoanData[index]!.quantityPrepared =
            processedLoanData[index]!.quantityPrepared + 1;
        }
        if (loanData.issuedById !== null) {
          processedLoanData[index]!.quantityCollected =
            processedLoanData[index]!.quantityCollected + 1;
        }
        if (equipment.status === "RETURNED") {
          processedLoanData[index]!.quantityReturned =
            processedLoanData[index]!.quantityReturned + 1;
        }
      }
    }
  });
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/4">Item Description</TableHead>
          <TableHead className="w-1/4">Checklist</TableHead>
          <TableHead>Quantity Requested</TableHead>
          <TableHead>Quantity Approved</TableHead>
          <TableHead>Quantity Prepared</TableHead>
          <TableHead>Quantity Collected</TableHead>
          <TableHead>Quantity Returned</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {processedLoanData.map((loanItem) => (
          <TableRow
            key={loanItem.id}
            className={
              loanItem.quantityReturned !== loanItem.quantityCollected &&
              outstandingItems
                ? "text-red-500"
                : ""
            }
          >
            <TableCell className="font-medium">
              {loanItem.description}
            </TableCell>
            <TableCell>{loanItem.checklist}</TableCell>
            <TableCell>{loanItem.quantityRequested}</TableCell>
            <TableCell>{loanItem.quantityApproved}</TableCell>
            <TableCell>{loanItem.quantityPrepared}</TableCell>
            <TableCell>{loanItem.quantityCollected}</TableCell>
            <TableCell>{loanItem.quantityReturned}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default LoanDetailsTable;
