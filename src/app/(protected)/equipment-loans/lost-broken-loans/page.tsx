import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import { type LoanStatus } from "@/db/enums";
import LostBrokenLoanComponent from "./_components/LostBrokenLoan";

export interface LostBrokenLoanType {
  id: string;
  loanId: string;
  status: string | undefined;
  remarks: string;
}

const LostBrokenLoanPage = async () => {
  const loanRequests = await api.loan.getUserLostAndBrokenLoans();

  const allSemesters = await api.loan.getSemesters();

  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Loans / Lost & Broken Loans"
        pageName="Lost / Broken Loans"
      />
      <LostBrokenLoanComponent
        lostAndBrokenLoans={loanRequests}
        allSemesters={allSemesters}
      />
    </div>
  );
};

export default LostBrokenLoanPage;
