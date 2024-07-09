import React from "react";
import { api } from "@/trpc/server";

import { redirect } from "next/navigation";
import TopHeaderComponent from "@/app/_components/TopHeader";
import WaiverDetails from "./_components/WaiverDetails";

interface pageProps {
  params: { id: string };
}

const loanPage = async ({ params }: pageProps) => {
  const waiverExist = await api.waiver.verifyWaiverByLoanId({ id: params.id });
  if (!waiverExist) {
    redirect("/loan-management/waiver");
  }

  return (
    <div className="">
      <TopHeaderComponent
        pageName="Waiver Details"
        pathName="Equipment Loans / Waiver Details"
      />
      <WaiverDetails id={params.id} />
    </div>
  );
};

export default loanPage;
