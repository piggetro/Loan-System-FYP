"use client";
import { api } from "@/trpc/react";
import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/_components/ui/use-toast";
import { Loan } from "@prisma/client";
import { PreparationColumns } from "./PreparationColumns";
import { PreparationDataTable } from "./PreparationDataTable";
import PreparationLoanDialog from "../../_components/PreparationLoanDialog";
import {
  AlertDialog,
  AlertDialogContent,
} from "@/app/_components/ui/alert-dialog";
import { DialogContent } from "@/app/_components/ui/dialog";
import { Skeleton } from "@/app/_components/ui/skeleton";

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
  const [openPreparationDialog, setOpenPreparationDialog] =
    useState<boolean>(false);
  const [preperationId, setPreparationId] = useState<string>("");
  // const [loanPendingApprovalData, setLoanPendingApprovalData] = useState()
  const loanPendingApprovalData = data?.filter(
    (loan) => loan.status === "PENDING_APPROVAL",
  );

  const onView = useCallback((loanDetails: Loan) => {
    router.push(`/equipment-loans/loans/${loanDetails.id}`);
  }, []);
  const onPreparation = useCallback((loanDetails: Loan) => {
    setPreparationId(loanDetails.id);
    setOpenPreparationDialog(true);
  }, []);

  const PreparationTableColumns = useMemo(
    () => PreparationColumns({ onView, onPreparation }),
    [],
  );

  return (
    <div className="rounded-lg bg-white p-5 shadow-lg">
      <AlertDialog open={openPreparationDialog}>
        <AlertDialogContent className=" h-3/4 w-11/12 max-w-none">
          <PreparationLoanDialog
            closeDialog={() => {
              setOpenPreparationDialog(false);
              refetch().catch(() => {
                toast({
                  title: "Something Unexpected Happen",
                  description:
                    "Please refresh your browser to view updated data",
                });
              });
            }}
            id={preperationId}
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
