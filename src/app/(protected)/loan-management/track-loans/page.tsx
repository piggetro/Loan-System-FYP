import TopHeaderComponent from "@/app/_components/TopHeader";
import React from 'react';
import { api } from "@/trpc/server";
import TrackLoans from "./_components/TrackLoans";
import { Loan, LoanItem } from "@prisma/client";

export interface TrackLoansType {
  loanId: string;
  dateRequested: Date;
  dateCollected: Date | null;
  dueDate: Date;
  approvingLecturer: string
}

const page = async () => {
  const data = await api.loan.getAllLoans();

  return (
    <div>
      <TopHeaderComponent
        pathName="Loan Management / Track Loans"
        pageName="Track Loans"
      />
      <TrackLoans
        data={data}
      />
    </div>
  );
}

export default page;