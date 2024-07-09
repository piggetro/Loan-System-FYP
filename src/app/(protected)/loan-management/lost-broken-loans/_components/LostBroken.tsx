/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useCallback, useMemo } from "react";

import { useRouter } from "next/navigation";

import { LostBrokenColumns } from "./LostBrokenColumns";
import { LostBrokenDataTable } from "./LostBrokenDataTable";
import { Skeleton } from "@/app/_components/ui/skeleton";

export interface LostBrokenLoanType {
  id: string;
  loanId: string;
  status: string | undefined;
  remarks: string;
  name: string;
}

const LostBrokenPage: React.FC<{
  allSemesters: { name: string }[];
  lostAndBrokenLoanData: LostBrokenLoanType[];
}> = ({ allSemesters, lostAndBrokenLoanData }) => {
  const router = useRouter();

  const onView = useCallback((loanDetails: LostBrokenLoanType) => {
    router.push(`/loan-management/waiver/${loanDetails.id}`);
  }, []);

  const LostBrokenTableColumns = useMemo(
    () => LostBrokenColumns({ onView }),
    [],
  );

  return (
    <div className="rounded-lg bg-white p-5 shadow-lg">
      {lostAndBrokenLoanData === undefined ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <LostBrokenDataTable
          columns={LostBrokenTableColumns}
          data={lostAndBrokenLoanData}
          allSemesters={allSemesters}
        />
      )}
    </div>
  );
};

export default LostBrokenPage;
