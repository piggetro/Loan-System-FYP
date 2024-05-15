"use client";
import { api } from "@/trpc/react";
import React, { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { useToast } from "@/app/_components/ui/use-toast";
import { Loan } from "@prisma/client";
import { LoanPendingApprovalColumns } from "@/app/(protected)/equipment-loans/loans/_components/LoanColumns";
import { PreparationColumns } from "./PreparationColumns";
import { PreparationDataTable } from "./PreparationDataTable";
import { Skeleton } from "@mantine/core";
import { Divide } from "lucide-react";

export interface PreparationLoanType extends Loan {
  loanedBy: { name: string };
}

const PreparationPage: React.FC<{
  allSemesters: { name: string }[];
}> = ({ allSemesters }) => {
  const { isLoading, data, refetch } =
    api.loanRequest.getLoansToPrepare.useQuery();

  const { toast } = useToast();
  const router = useRouter();
  const [openCancelDialog, setOpenCancelDialog] = useState<boolean>(false);
  const [cancelId, setCancelId] = useState<string>();
  // const [loanPendingApprovalData, setLoanPendingApprovalData] = useState()
  const loanPendingApprovalData = data?.filter(
    (loan) => loan.status === "PENDING_APPROVAL",
  );

  const onView = useCallback((loanDetails: Loan) => {
    router.push(`/equipment-loans/loans/${loanDetails.id}`);
  }, []);
  const onPreparation = useCallback((loanDetails: Loan) => {
    router.push(`/equipment-loans/loans/${loanDetails.id}`);
  }, []);

  const PreparationTableColumns = useMemo(
    () => PreparationColumns({ onView, onPreparation }),
    [],
  );

  return (
    <div className="rounded-lg bg-white p-5 shadow-lg">
      {data === undefined ? (
        <div>Loading</div>
      ) : (
        <PreparationDataTable
          columns={PreparationTableColumns}
          data={data}
          allSemesters={allSemesters}
        />
      )}
    </div>
  );
};

export default PreparationPage;
