/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import React, { useCallback, useMemo, useState } from "react";

import { type LostBrokenLoanType } from "../page";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useToast } from "@/app/_components/ui/use-toast";
import { LostBrokenLoanColumns } from "./LostBrokenLoanColumns";
import { LostBrokenLoanTable } from "./LostBrokenLoanDatatable";

const LostBrokenLoanComponent: React.FC<{
  lostAndBrokenLoans: LostBrokenLoanType[];
  allSemesters: { name: string }[];
}> = ({ lostAndBrokenLoans, allSemesters }) => {
  const [loanRequestsData] = useState<LostBrokenLoanType[]>(lostAndBrokenLoans);
  const router = useRouter();

  const onView = useCallback((LostBrokenLoanDetails: LostBrokenLoanType) => {
    router.push(
      `/equipment-loans/lost-broken-loans/${LostBrokenLoanDetails.id}`,
    );
  }, []);

  const TableColumns = useMemo(() => LostBrokenLoanColumns({ onView }), []);

  return (
    <div className="bg-white">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <LostBrokenLoanTable
          data={loanRequestsData}
          columns={TableColumns}
          allSemesters={allSemesters}
        />
      </div>
    </div>
  );
};

export default LostBrokenLoanComponent;
