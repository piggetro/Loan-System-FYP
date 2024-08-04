import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import { type WaiveRequestStatus } from "@/db/enums";
import WaiverComponent from "./_components/Waiver";

export interface WaiverType {
  loanId: string;
  id: string | null;
  dateIssued: Date;
  dateUpdated: Date | null;
  status: WaiveRequestStatus;
  remarks: string;
}

const LostDamagedLoanPage = async () => {
  const waivers = await api.loan.getUsersWaivers();
  const allSemesters = await api.loan.getSemesters();

  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Loans / Waiver"
        pageName="Waiver"
      />
      <WaiverComponent waivers={waivers} allSemesters={allSemesters} />
    </div>
  );
};

export default LostDamagedLoanPage;
