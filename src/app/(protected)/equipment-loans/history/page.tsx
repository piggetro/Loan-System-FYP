import React from "react";
import TopHeaderComponent from "@/app/_components/TopHeader";
import { api } from "@/trpc/server";
import HistoryPage from "./_components/History";

const page = async () => {
  const loanHistory = await api.loan.getUserLoanHistory();
  const allSemesters = await api.loan.getSemesters();
  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Loans / History"
        pageName="History"
      />
      <HistoryPage allSemesters={allSemesters} loanHistory={loanHistory} />
    </div>
  );
};

export default page;
