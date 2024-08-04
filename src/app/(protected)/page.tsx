import React from "react";
import TopHeaderComponent from "../_components/TopHeader";
import { api } from "@/trpc/server";
import Dashboard from "./_components/Dashboard";
import { OverdueLoans } from "./_components/OverdueLoansColumns";

const page = async () => {
  const [
    currentLoans,
    overdueLoans,
    outstandingLoans,
    historyLoans,
    approvalLoans,
  ] = await Promise.all([
    api.user.getUserCurrentLoans(),
    api.loan.getUsersOverdueLoans(),
    api.loan.getUserLostAndDamagedLoans(),
    api.loan.getUserLoanHistory(),
    api.loanRequest.getUserApprovalManagementLoanRequests(),
  ]);

  const allOutstandingLoans: OverdueLoans[] = [];

  overdueLoans.forEach((item) => {
    allOutstandingLoans.push({
      id: item.id,
      loanId: item.loanId,
      dueDate: item.dueDate,
      remarks: "Overdue",
      dateCreated: item.dateCreated,
      status: item.status,
    });
  });

  outstandingLoans.forEach((item) => {
    allOutstandingLoans.push({
      id: item.id,
      loanId: item.loanId,
      dueDate: item.dueDate,
      remarks: item.remarks,
      dateCreated: item.dateCreated,
      status: item.status,
    });
  });
  return (
    <div>
      <TopHeaderComponent
        pathName="Dashboard"
        pageName="Welcome to School Of Computing Loan System"
      />
      <Dashboard
        currentLoans={currentLoans}
        outstandingLoans={allOutstandingLoans}
        historyLoans={historyLoans}
        approvalLoans={approvalLoans}
      />
    </div>
  );
};

export default page;
