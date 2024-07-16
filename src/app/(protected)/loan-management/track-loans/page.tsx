import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import TrackLoansPage from "./_components/TrackLoans";
import { api } from "@/trpc/server";

const page = async () => {
  const allSemesters = await api.loan.getSemesters();
  return (
    <div>
      <TopHeaderComponent
        pageName="Track Loans"
        pathName="Loan Management / Track Loans"
      />
      <TrackLoansPage allSemesters={allSemesters} />
    </div>
  );
};

export default page;
