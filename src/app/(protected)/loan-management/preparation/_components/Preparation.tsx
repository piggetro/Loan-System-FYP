/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { api } from "@/trpc/react";
import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PreparationColumns } from "./PreparationColumns";
import { PreparationDataTable } from "./PreparationDataTable";
import PreparationLoanDialog from "../../_components/PreparationLoanDialog";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { useToast } from "@/app/_components/ui/use-toast";
import { type LoanStatus } from "@/db/enums";

export interface PreparationLoanType {
  id: string;
  loanId: string;
  remarks: string;
  dueDate: Date;
  status: LoanStatus;
  signature: string | null;
  loanedById: string | null;
  approvedById: string | null;
  preparedById: string | null;
  issuedById: string | null;
  returnedToId: string | null;
  approverId: string | null;
  dateCreated: Date;
  collectionReferenceNumber: string | null;
  datePrepared: Date | null;
  dateIssued: Date | null;
  dateCollected: Date | null;
  dateReturned: Date | null;
  loanedBy: { name: string } | null;
}

const PreparationPage: React.FC<{
  allSemesters: { name: string }[];
}> = ({ allSemesters }) => {
  const { data: loanToPrepareData, refetch } =
    api.loanRequest.getLoansToPrepare.useQuery();

  const router = useRouter();
  const [openPreparationDialog, setOpenPreparationDialog] =
    useState<boolean>(false);
  const [preperationId, setPreparationId] = useState<string>();
  // const [loanPendingApprovalData, setLoanPendingApprovalData] = useState()
  const { toast } = useToast();
  const onView = useCallback((loanDetails: PreparationLoanType) => {
    router.push(`/equipment-loans/loans/${loanDetails.id}?prev=preparation`);
  }, []);
  const onPreparation = useCallback((loanDetails: PreparationLoanType) => {
    setPreparationId(loanDetails.id);
    setOpenPreparationDialog(true);
  }, []);
  const onSuccessClose = () => {
    setOpenPreparationDialog(false);
    refetch().catch(() => {
      toast({
        title: "Unable to Refresh Page",
        description: "Please refresh page to see latest update",
        variant: "destructive",
      });
    });
  };

  const PreparationTableColumns = useMemo(
    () => PreparationColumns({ onView, onPreparation }),
    [],
  );

  return (
    <div className="rounded-lg bg-white p-5 shadow-lg">
      {preperationId !== undefined ? (
        <PreparationLoanDialog
          isDialogOpen={openPreparationDialog}
          setIsDialogOpen={setOpenPreparationDialog}
          onSuccessClose={onSuccessClose}
          id={preperationId}
        />
      ) : null}
      {loanToPrepareData === undefined ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <>
          <PreparationDataTable
            columns={PreparationTableColumns}
            data={loanToPrepareData}
            allSemesters={allSemesters}
          />
        </>
      )}
    </div>
  );
};

export default PreparationPage;
