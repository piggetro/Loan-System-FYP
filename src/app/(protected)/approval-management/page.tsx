import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import ApprovalManagementComponent from "./_components/ApprovalManagement";
import { type Loan } from "@prisma/client";

export interface ApprovalManagementType extends Loan {
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
