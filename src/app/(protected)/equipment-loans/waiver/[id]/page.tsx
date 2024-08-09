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
    redirect("/equipment-loans/waiver");
  }

  return (
    <div className="">
      <TopHeaderComponent
        pageName="Waiver"
        pathName="Equipment Loans / Waiver"
        goBackLink="/equipment-loans/waiver"
      />
      <LostBrokenLoanDetails id={params.id} />
    </div>
  );
};

export default LostBrokenLoanDetailsPage;
