/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useCallback, useMemo } from "react";

import { useRouter } from "next/navigation";

import { type Loan } from "@prisma/client";
import { HistoryColumns } from "./HistoryColumns";
import { CollectionDataTable } from "./HistoryDataTable";
import { Skeleton } from "@/app/_components/ui/skeleton";

export interface HistoryLoanType extends Loan {
  loanedBy: { name: string } | null;
  approvingLecturer: { name: string } | null;
}

const HistoryPage: React.FC<{
  allSemesters: { name: string }[];
  loanHistory: HistoryLoanType[];
}> = ({ allSemesters, loanHistory }) => {
  const router = useRouter();

  const onView = useCallback((loanDetails: Loan) => {
    router.push(`/equipment-loans/loans/${loanDetails.id}`);
  }, []);

  const HistoryTableColumns = useMemo(() => HistoryColumns({ onView }), []);

  return (
    <div className="rounded-lg bg-white p-5 shadow-lg">
      {loanHistory === undefined ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <CollectionDataTable
          columns={HistoryTableColumns}
          data={loanHistory}
          allSemesters={allSemesters}
        />
      )}
    </div>
  );
};

export default HistoryPage;
