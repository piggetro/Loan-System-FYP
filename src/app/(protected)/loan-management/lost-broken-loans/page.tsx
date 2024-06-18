import React from "react";
import LostBrokenPage from "./_components/LostBroken";
import TopHeaderComponent from "@/app/_components/TopHeader";
import { api } from "@/trpc/server";
const page = async () => {
  const allSemesters = await api.loan.getSemesters();
  const lostAndBrokenLoanData = await api.loanRequest.getLostAndBrokenLoans();
  return (
    <div>
      <TopHeaderComponent
        pageName="Lost/Broken"
        pathName="Loan Management / Lost/Broken"
      />
      <LostBrokenPage
        allSemesters={allSemesters}
        lostAndBrokenLoanData={lostAndBrokenLoanData}
      />
    </div>
  );
};

export default page;
