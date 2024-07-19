/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import React, { useCallback, useMemo, useState } from "react";

import { type LostDamagedLoanType } from "../page";
import { useRouter } from "next/navigation";
import { LostDamagedLoanColumns } from "./LostDamagedLoanColumns";
import { LostDamagedLoanTable } from "./LostDamagedLoanDatatable";

const LostDamagedLoanComponent: React.FC<{
  lostAndDamagedLoans: LostDamagedLoanType[];
  allSemesters: { name: string }[];
}> = ({ lostAndDamagedLoans, allSemesters }) => {
  const [loanRequestsData] =
    useState<LostDamagedLoanType[]>(lostAndDamagedLoans);
  const router = useRouter();

  const onView = useCallback((LostDamagedLoanDetails: LostDamagedLoanType) => {
    router.push(`/equipment-loans/loans/${LostDamagedLoanDetails.id}?prev=lost-damaged`);
  }, []);
  const onViewWaiver = useCallback(
    (LostDamagedLoanDetails: LostDamagedLoanType) => {
      router.push(
        `/equipment-loans/lost-damaged-loans/${LostDamagedLoanDetails.id}`,
      );
    },
    [],
  );

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
