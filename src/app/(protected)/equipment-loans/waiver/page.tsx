import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import LostDamagedLoanComponent from "./_components/Waiver";
import { WaiveRequestStatus } from "@/db/enums";

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
      <LostDamagedLoanComponent waivers={waivers} allSemesters={allSemesters} />
    </div>
  );
};

export default LostDamagedLoanPage;
