import TopHeaderComponent from "@/app/_components/TopHeader";
import { api } from "@/trpc/server";
import React from "react";
import LoanPage from "./_components/LoanPage";
import { type LoanStatus } from "@/db/enums";

export interface LoanTableDataType {
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
  approvingLecturerName: string | null;
}

const page = async () => {
  const userLoans = await api.loan.getUsersLoans();
  const allSemesters = await api.loan.getSemesters();

  return (
    <div>
      <TopHeaderComponent pageName="Loans" pathName="Equipment Loans / Loans" />

      <LoanPage allSemesters={allSemesters} userLoans={userLoans} />
    </div>
  );
};

export default page;
