import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import { type LoanStatus } from "@/db/enums";
import OverdueLoanComponent from "./_components/OverdueLoan";

export interface OverdueLoanType {
  id: string;
  loanId: string;
  status: string | undefined;
  remarks: string;
}

const OverdueLoanPage = async () => {
  const overdueLoans = await api.loan.getOverdueLoans();

  const allSemesters = await api.loan.getSemesters();

  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Loans / Overdue Loans"
        pageName="Overdue Loans"
      />
      <OverdueLoanComponent
        overdueLoans={overdueLoans}
        allSemesters={allSemesters}
      />
    </div>
  );
};

export default OverdueLoanPage;
