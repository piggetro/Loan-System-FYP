import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import WaiverComponent from "./_components/Waiver";
import { type WaiveRequestStatus } from "@/db/enums";

export interface WaiverType {
  id: string;
  status: WaiveRequestStatus;
  loanId: string;
  reason: string | null;
  remarks: string | null;
  dateIssued: Date;
  approvedByUserId: string | null;
  loanItemId: string;
  loanedBy: string | null;
  loan_id: string | null;
}

const WaiverPage = async () => {
  const pendingWaivers = await api.waiver.getPendingWaiver();

  const waiverHistory = await api.waiver.getWaiverHistory();

  const allSemesters = await api.loan.getSemesters();

  return (
    <div>
      <TopHeaderComponent
        pathName="Loan Management / Waiver"
        pageName="Waiver"
      />
      <WaiverComponent
        loanRequests={pendingWaivers}
        loanRequestHistory={waiverHistory}
        allSemesters={allSemesters}
      />
    </div>
  );
};

export default WaiverPage;
