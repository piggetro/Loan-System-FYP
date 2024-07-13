import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import ApprovalManagementComponent from "./_components/ApprovalManagement";
import { type LoanStatus } from "@/db/enums";

export interface ApprovalManagementType {
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
  loanedBy: {
    name: string;
  } | null;
  approvingLecturer: {
    name: string;
  } | null;
  loanItems: {
    equipment: {
      name: string;
    } | null;
  }[];
}

const ApprovalManagementPage = async () => {
  const loanRequests =
    await api.loanRequest.getUserApprovalManagementLoanRequests();

  const loanRequestsHistory =
    await api.loanRequest.getUserApprovalManagementLoanHistory();

  const allSemesters = await api.loan.getSemesters();

  return (
    <div>
      <TopHeaderComponent
        pathName="Approval Management"
        pageName="Approval Management"
      />
      <ApprovalManagementComponent
        loanRequests={loanRequests}
        loanRequestHistory={loanRequestsHistory}
        allSemesters={allSemesters}
      />
    </div>
  );
};

export default ApprovalManagementPage;
