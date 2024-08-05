import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import { type LoanStatus } from "@/db/enums";
import LostDamagedLoanComponent from "./_components/LostDamagedLoan";

export interface LostDamagedLoanType {
  id: string;
  loanId: string;
  status: LoanStatus;
  remarks: string;
  dueDate: Date;
  dateCreated: Date;
  approver: string | null;
}

const LostDamagedLoanPage = async () => {
  const lostDamagedLoans = await api.loan.getUserLostAndDamagedLoans();

  const allSemesters = await api.loan.getSemesters();

  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Loans / Lost & Damaged Loans"
        pageName="Lost / Damaged Loans"
      />
      <LostDamagedLoanComponent
        lostAndDamagedLoans={lostDamagedLoans}
        allSemesters={allSemesters}
      />
    </div>
  );
};

export default LostDamagedLoanPage;
