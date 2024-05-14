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
  const getUserAccessRights = await api.loan.getUsersLoanAccess({
    id: params.id,
  });
  if (!loanExist) {
    redirect("/equipment-loans/loans");
  } else {
  }
  return (
    <div className="">
      <TopHeaderComponent
        pageName="Loan Details"
        pathName="Equipment Loans / Loan Details"
      />
      <LoanDetails userAccessRights={getUserAccessRights} id={params.id} />
    </div>
  );
};

export default loanPage;
