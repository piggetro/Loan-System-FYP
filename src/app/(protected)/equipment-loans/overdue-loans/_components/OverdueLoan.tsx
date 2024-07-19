/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import React, { useCallback, useMemo, useState } from "react";

import { type OverdueLoanType } from "../page";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useToast } from "@/app/_components/ui/use-toast";
import { OverdueLoanColumns } from "./OverdueLoanColumns";
import { OverdueLoanTable } from "./OverdueLoanDatatable";

const OverdueLoanComponent: React.FC<{
  overdueLoans: OverdueLoanType[];
  allSemesters: { name: string }[];
}> = ({ overdueLoans, allSemesters }) => {
  const [overdueLoansData] = useState<OverdueLoanType[]>(overdueLoans);
  const router = useRouter();

  const onView = useCallback((OverdueLoanDetails: OverdueLoanType) => {
    router.push(`/equipment-loans/loans/${OverdueLoanDetails.id}?prev=overdue`);
  }, []);

  const TableColumns = useMemo(() => OverdueLoanColumns({ onView }), []);

  return (
    <div className="rounded-md bg-white shadow-lg">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <OverdueLoanTable
          data={overdueLoansData}
          columns={TableColumns}
          allSemesters={allSemesters}
        />
      </div>
    </div>
  );
};

export default OverdueLoanComponent;
