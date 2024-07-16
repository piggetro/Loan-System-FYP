import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import WaiverComponent from "./_components/Waiver";
import { type WaiveRequestStatus } from "@/db/enums";

export interface WaiverType {
  id: string;
  loanId: string;
  remarks: string | null;
  status: WaiveRequestStatus;
  dateIssued: Date;
  waiveRequest: string | null;
  dateUpdated: Date | null;
  loanedBy: string | null;
  loan_id: string | null;
}

const WaiverPage = async () => {
  const waivers = await api.waiver.getWaivers();

  const allSemesters = await api.loan.getSemesters();

  return (
    <div>
      <TopHeaderComponent
        pathName="Loan Management / Waiver"
        pageName="Waiver"
      />
      <WaiverComponent loanRequests={waivers} allSemesters={allSemesters} />
    </div>
  );
};

export default WaiverPage;
