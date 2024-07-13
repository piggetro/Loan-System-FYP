import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import { type LoanStatus } from "@/db/enums";
import LostDamagedLoanComponent from "./_components/LostDamagedLoan";

export interface LostDamagedLoanType {
  id: string;
  loanId: string;
  status: string | undefined;
  remarks: string;
}

const LostDamagedLoanPage = async () => {
  const loanRequests = await api.loan.getUserLostAndDamagedLoans();

  const allSemesters = await api.loan.getSemesters();

  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Loans / Lost & Damaged Loans"
        pageName="Lost / Damaged Loans"
      />
      <LostDamagedLoanComponent
        lostAndDamagedLoans={loanRequests}
        allSemesters={allSemesters}
      />
    </div>
  );
};

export default LostDamagedLoanPage;
