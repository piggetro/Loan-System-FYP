/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { api } from "@/trpc/react";
import React, { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { useToast } from "@/app/_components/ui/use-toast";
import { type Loan } from "@prisma/client";
import { PreparationColumns } from "./ReturnColumns";
import { ReturnDataTable } from "./ReturnDataTable";
import { Skeleton } from "@/app/_components/ui/skeleton";

import {
  AlertDialog,
  AlertDialogContent,
} from "@/app/_components/ui/alert-dialog";
import ReturnLoanDialog from "../../_components/ReturnLoanDialog";

export interface PreparationLoanType extends Loan {
  loanedBy: { name: string } | null;
}

const PreparationPage: React.FC<{
  allSemesters: { name: string }[];
}> = ({ allSemesters }) => {
  const { data, refetch } = api.loanRequest.getLoansForReturn.useQuery();

  const { toast } = useToast();
  const router = useRouter();
  const [openReturnDialog, setOpenReturnDialog] = useState<boolean>(false);
  const [returnId, setReturnId] = useState<string>("");

  const onView = useCallback((loanDetails: Loan) => {
    router.push(`/equipment-loans/loans/${loanDetails.id}`);
  }, []);
  const onReturn = useCallback((loanDetails: Loan) => {
    setReturnId(loanDetails.id);
    setOpenReturnDialog(true);
  }, []);

  const PreparationTableColumns = useMemo(
    () => PreparationColumns({ onView, onReturn }),
    [],
  );

  return (
    <div className="rounded-lg bg-white p-5 shadow-lg">
      <AlertDialog open={openReturnDialog}>
        <AlertDialogContent className=" h-3/4 w-11/12 max-w-none">
          <ReturnLoanDialog
            closeDialog={() => {
              setOpenReturnDialog(false);
              refetch().catch(() => {
                toast({
                  title: "Something Unexpected Happen",
                  description:
                    "Please refresh your browser to view updated data",
                });
              });
            }}
            id={returnId}
          />
        </AlertDialogContent>
      </AlertDialog>
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

export default PreparationPage;
