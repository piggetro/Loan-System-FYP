import React from "react";
import TopHeaderComponent from "../_components/TopHeader";
import { api } from "@/trpc/server";
import Dashboard from "./_components/Dashboard";

const page = async () => {
  const [currentLoans, overdueLoans, historyLoans, approvalLoans] =
    await Promise.all([
      api.user.getUserCurrentLoans(),
      api.user.getUserOverdueLoans(),
      api.loan.getUserLoanHistory(),
      api.loanRequest.getUserApprovalManagementLoanRequests(),
    ]);

  return (
    <div>
      <TopHeaderComponent
        pathName="Dashboard"
        pageName="Welcome to School Of Computing Loan System"
      />
      <Dashboard
        currentLoans={currentLoans}
        overdueLoans={overdueLoans}
        historyLoans={historyLoans}
        approvalLoans={approvalLoans}
      />
    </div>
  );
};

export default page;
