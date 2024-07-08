import React from "react";
import { api } from "@/trpc/server";

import { redirect } from "next/navigation";
import TopHeaderComponent from "@/app/_components/TopHeader";
import LoanDetails from "./_components/LoanDetails";

interface pageProps {
  params: { id: string };
}

const loanPage = async ({ params }: pageProps) => {
  const loanExist = await api.loan.verifyLoanById({ id: params.id });
  if (!loanExist) {
    redirect("/equipment-loans/loans");
  }
  const userAccessRight = await api.loan.getUsersLoanAccess({ id: params.id });
  if (userAccessRight.length === 0) {
    redirect("/equipment-loans/loans");
  }

  return (
    <div className="">
      <TopHeaderComponent
        pageName="Loan Details"
        pathName="Equipment Loans / Loan Details"
        goBackLink="/equipment-loans/loans"
      />
      <LoanDetails id={params.id} />
    </div>
  );
};

export default loanPage;
