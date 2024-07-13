/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useCallback, useMemo } from "react";

import { useRouter } from "next/navigation";

import { LostDamagedColumns } from "./LostDamagedColumns";
import { LostDamagedDataTable } from "./LostDamagedDataTable";
import { Skeleton } from "@/app/_components/ui/skeleton";

export interface LostDamagedLoanType {
  id: string;
  loanId: string;
  status: string | undefined;
  remarks: string;
  name: string;
}

const LostDamagedPage: React.FC<{
  allSemesters: { name: string }[];
  lostAndDamagedLoanData: LostDamagedLoanType[];
}> = ({ allSemesters, lostAndDamagedLoanData }) => {
  const router = useRouter();

  const onView = useCallback((loanDetails: LostDamagedLoanType) => {
    router.push(`/loan-management/waiver/${loanDetails.id}`);
  }, []);

  const LostDamagedTableColumns = useMemo(
    () => LostDamagedColumns({ onView }),
    [],
  );

  return (
    <div className="rounded-lg bg-white p-5 shadow-lg">
      {lostAndDamagedLoanData === undefined ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <LostDamagedDataTable
          columns={LostDamagedTableColumns}
          data={lostAndDamagedLoanData}
          allSemesters={allSemesters}
        />
      )}
    </div>
  );
};

export default LostDamagedPage;
