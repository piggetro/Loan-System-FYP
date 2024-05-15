import TopHeaderComponent from "@/app/_components/TopHeader";
import { api } from "@/trpc/server";
import React from "react";
import { LoanDataTable } from "./_components/LoanDataTable";
import { LoanColumns } from "./_components/LoanColumns";
import { Loan } from "@prisma/client";
import LoanPage from "./_components/LoanPage";

export interface LoanTableDataType extends Loan {
  approvingLecturer: { name: string };
}

const page = async () => {
  const userLoans = await api.loan.getUsersLoans();
  const allSemesters = await api.loan.getSemesters();

  return (
    <div>
      <TopHeaderComponent pageName="Loans" pathName="Equipment Loans / Loans" />

      <LoanPage allSemesters={allSemesters} userLoans={userLoans} />
    </div>
  );
};

export default page;
