import React from "react";
import LostDamagedPage from "./_components/LostDamaged";
import TopHeaderComponent from "@/app/_components/TopHeader";
import { api } from "@/trpc/server";
const page = async () => {
  const allSemesters = await api.loan.getSemesters();
  const lostAndDamagedLoanData = await api.loanRequest.getLostAndDamagedLoans();
  return (
    <div>
      <TopHeaderComponent
        pageName="Lost/Damaged"
        pathName="Loan Management / Lost/Damaged"
      />
      <LostDamagedPage
        allSemesters={allSemesters}
        lostAndDamagedLoanData={lostAndDamagedLoanData}
      />
    </div>
  );
};

export default page;
