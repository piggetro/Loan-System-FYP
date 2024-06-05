import TopHeaderComponent from "@/app/_components/TopHeader";
import React from 'react';
import { api } from "@/trpc/server";
import TrackLoans from "./_components/TrackLoans";
import { Loan, LoanItem } from "@prisma/client";

export interface TrackLoansType {
  id: string;
  loanId: string;
  dateRequested: Date;
  dateCollected: Date | null;
  dueDate: Date;
  approvingLecturer: string | undefined;
}

const page = async () => {
  const data = await api.loan.getAllLoans();
  const allSemesters = await api.loan.getSemesters();
  return (
    <div>
      <TopHeaderComponent
        pathName="Loan Management / Track Loans"
        pageName="Track Loans"
      />
      <TrackLoans
        data={data} allSemesters={allSemesters}
      />
    </div>
  );
}

export default page;