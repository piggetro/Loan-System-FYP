/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import React, { useCallback, useMemo, useState } from "react";

import { type WaiverType } from "../page";
import { useRouter } from "next/navigation";
import { LostDamagedLoanColumns } from "./WaiverColumns";
import { LostDamagedLoanTable } from "./WaiverDatatable";

const LostDamagedLoanComponent: React.FC<{
  waivers: WaiverType[];
  allSemesters: { name: string }[];
}> = ({ waivers, allSemesters }) => {
  const [loanRequestsData] = useState<WaiverType[]>(waivers);
  const router = useRouter();

  const onView = useCallback((LostDamagedLoanDetails: WaiverType) => {
    router.push(
      `/equipment-loans/loans/${LostDamagedLoanDetails.id}?prev=equipment-loans-waiver`,
    );
  }, []);
  const onViewWaiver = useCallback((LostDamagedLoanDetails: WaiverType) => {
    router.push(
      `/equipment-loans/waiver/${LostDamagedLoanDetails.id}?prev=equipment-loans-waiver`,
    );
  }, []);

  const TableColumns = useMemo(
    () => LostDamagedLoanColumns({ onView, onViewWaiver }),
    [],
  );

  return (
    <div className="rounded-md bg-white shadow-lg">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <LostDamagedLoanTable
          data={loanRequestsData}
          columns={TableColumns}
          allSemesters={allSemesters}
        />
      </div>
    </div>
  );
};

export default LostDamagedLoanComponent;
