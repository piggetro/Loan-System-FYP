import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import ApprovalManagementComponent from "./_components/ApprovalManagement";
import { Loan, LoanItem } from "@prisma/client";

export interface ApprovalManagementType extends Loan {
  loanedBy: {
    name: string;
  };
  approvingLecturer: {
    name: string;
  };
  loanItems: {
    equipment: {
      name: string;
    };
  }[];
}

const ApprovalManagementPage = async () => {
  const loanRequests =
    await api.loanRequest.getUserApprovalManagementLoanRequests();

  const loanRequestsHistory =
    await api.loanRequest.getUserApprovalManagementLoanHistory();

  return (
    <div>
      <TopHeaderComponent
        pathName="Approval Management"
        pageName="Approval Management"
      />
      <ApprovalManagementComponent
        loanRequests={loanRequests}
        loanRequestHistory={loanRequestsHistory}
      />
    </div>
  );
};

export default ApprovalManagementPage;
