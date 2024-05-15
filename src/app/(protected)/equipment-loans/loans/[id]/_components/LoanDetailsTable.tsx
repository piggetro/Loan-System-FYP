/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/_components/ui/table";
import { Equipment, Loan } from "@prisma/client";
import { useState } from "react";
interface LoanDetailsData extends Loan {
  loanItems: { equipment: Equipment }[];
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
}> = ({ loanData }) => {
  const processedLoanData: EquipmentDataType[] = [];
  loanData.loanItems.forEach((equipment) => {
    const index = processedLoanData.findIndex(
      (equipmentInArr) => equipmentInArr.id === equipment.equipment.id,
    );

    if (index === -1) {
      const tempEquipmentObject: EquipmentDataType = {
        id: equipment.equipment.id,
        description: equipment.equipment.name,
        checklist: equipment.equipment.checklist,
        quantityRequested: 1,
        quantityApproved: 0,
        quantityPrepared: 0,
        quantityCollected: 0,
        quantityReturned: 0,
      };

      if (loanData.approvedById != null) {
        tempEquipmentObject.quantityApproved = 1;
      }
      processedLoanData.push(tempEquipmentObject);
    } else {
      if (processedLoanData[index] != undefined) {
        // @ts-expect-error Quantity requested needs to be incremented.
        processedLoanData[index].quantityRequested = processedLoanData[index].quantityRequested + 1;
        if (loanData.approvedById != null) {
          // @ts-expect-error Quantity approved needs to be incremented.
          processedLoanData[index].quantityApproved = processedLoanData[index].quantityApproved + 1;
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
          <TableRow key={loanItem.id}>
            <TableCell className="font-medium">
              {loanItem.description}
            </TableCell>
            <TableCell>{loanItem.checklist}</TableCell>
            <TableCell>{loanItem.quantityRequested}</TableCell>
            <TableCell>{loanItem.quantityApproved}</TableCell>
            <TableCell>0</TableCell>
            <TableCell>0</TableCell>
            <TableCell>0</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default LoanDetailsTable;
