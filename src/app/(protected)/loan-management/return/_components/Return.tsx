/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { api } from "@/trpc/react";
import React, { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { useToast } from "@/app/_components/ui/use-toast";
import { PreparationColumns } from "./ReturnColumns";
import { ReturnDataTable } from "./ReturnDataTable";
import { Skeleton } from "@/app/_components/ui/skeleton";

import {
  AlertDialog,
  AlertDialogContent,
} from "@/app/_components/ui/alert-dialog";
import ReturnLoanDialog from "../../_components/ReturnLoanDialog";
import { type LoanStatus } from "@/db/enums";
import { Dialog, DialogContent } from "@/app/_components/ui/dialog";

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

const ReturnPage: React.FC<{
  allSemesters: { name: string }[];
}> = ({ allSemesters }) => {
  const { data, refetch } = api.loanRequest.getLoansForReturn.useQuery();
  const isUserOwnLoad = api.loanRequest.checkIfUsersOwnLoan.useMutation();

  const { toast } = useToast();
  const router = useRouter();
  const [openReturnDialog, setOpenReturnDialog] = useState<boolean>(false);
  const [returnId, setReturnId] = useState<string>("");

  const onView = useCallback((loanDetails: PreparationLoanType) => {
    router.push(`/equipment-loans/loans/${loanDetails.id}?prev=return`);
  }, []);
  const onReturn = useCallback((loanDetails: PreparationLoanType) => {
    isUserOwnLoad
      .mutateAsync({ id: loanDetails.id })
      .then((results) => {
        if (results) {
          toast({
            title: "Unable to Return loan",
            description: "Unable to return own loan",
            variant: "destructive",
          });
        } else {
          setReturnId(loanDetails.id);
          setOpenReturnDialog(true);
        }
      })
      .catch((e) => {
        toast({
          title: "An error occurred. Please try again later.",
          variant: "destructive",
        });
      });
  }, []);

  const PreparationTableColumns = useMemo(
    () => PreparationColumns({ onView, onReturn }),
    [],
  );

  return (
    <div className="rounded-lg bg-white p-5 shadow-lg">
      <Dialog open={openReturnDialog} onOpenChange={setOpenReturnDialog}>
        <DialogContent className=" h-3/4 w-11/12 max-w-none">
          <ReturnLoanDialog
            closeDialog={() => {
              setOpenReturnDialog(false);
              refetch().catch(() => {
                toast({
                  title: "An unexpected error occured. Please try again later",
                  description:
                    "Please refresh your browser to view updated data",
                });
              });
            }}
            id={returnId}
          />
        </DialogContent>
      </Dialog>
      {data === undefined ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <ReturnDataTable
          columns={PreparationTableColumns}
          data={data}
          allSemesters={allSemesters}
        />
      )}
    </div>
  );
};

export default ReturnPage;
