import React from "react";
import { api } from "@/trpc/server";

import { redirect } from "next/navigation";
import TopHeaderComponent from "@/app/_components/TopHeader";
import LostBrokenLoanDetails from "./_components/LostDamagedLoanDetails";

interface pageProps {
  params: { id: string };
}

const LostBrokenLoanDetailsPage = async ({ params }: pageProps) => {
  const LostBrokenLoanExist = await api.loan.verifyLostBrokenLoanByLoanId({
    id: params.id,
  });
  if (!LostBrokenLoanExist) {
    redirect("/loan-management/LostBrokenLoan");
  }

  return (
    <div className="">
      <TopHeaderComponent
        pageName="Waiver"
        pathName="Equipment Loans / Lost & Broken Loan"
        goBackLink="/equipment-loans/waiver"
      />
      <LostBrokenLoanDetails id={params.id} />
    </div>
  );
};

export default LostBrokenLoanDetailsPage;
