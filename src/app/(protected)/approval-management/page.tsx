import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import ApprovalManagementComponent from "./_components/ApprovalManagement";
import { type LoanStatus } from "@/db/enums";

export interface ApprovalManagementType {
  id: string;
  loanId: string;
  dueDate: Date;
  status: LoanStatus;
  dateCreated: Date;
  loanedBy: {
    name: string;
  } | null;
}

const ApprovalManagementPage = async () => {
  const allSemesters = await api.loan.getSemesters();

  return (
    <div>
      <TopHeaderComponent
        pathName="Approval Management"
        pageName="Approval Management"
      />
      <ApprovalManagementComponent allSemesters={allSemesters} />
    </div>
  );
};

export default ApprovalManagementPage;
