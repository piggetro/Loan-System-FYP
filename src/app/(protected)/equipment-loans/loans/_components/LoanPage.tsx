"use client";
import { api } from "@/trpc/server";
import React, { useCallback, useMemo } from "react";

import { useRouter } from "next/navigation";
import { LoanTableDataType } from "../page";
import { LoanColumns } from "./LoanColumns";
import { LoanDataTable } from "./LoanDataTable";

const LoanPage: React.FC<{
  allSemesters: { name: string }[];
  userLoans: LoanTableDataType[];
}> = ({ allSemesters, userLoans }) => {
  const router = useRouter();
  const onView = useCallback((loanDetails: LoanTableDataType) => {
    router.push(`/equipment-loans/loans/${loanDetails.id}`);
  }, []);
  const onDelete = useCallback((loanDetails: LoanTableDataType) => {
    router.push(`/equipment-loans/loans/${loanDetails.id}`);
  }, []);
  const TableColumns = useMemo(() => LoanColumns({ onView, onDelete }), []);

  return (
    <div className="rounded-lg bg-white p-5 shadow-lg">
      <LoanDataTable
        data={userLoans}
        columns={TableColumns}
        allSemesters={allSemesters}
      />
    </div>
  );
};

export default LoanPage;
