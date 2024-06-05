/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { api } from "@/trpc/react";
import React, { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { useToast } from "@/app/_components/ui/use-toast";
import { type Loan } from "@prisma/client";
import { CollectionColumns } from "./CollectionColumns";
import { CollectionDataTable } from "./CollectionDataTable";
import CollectionLoanDialog from "../../_components/CollectionLoanDialog";
import {
  AlertDialog,
  AlertDialogContent,
} from "@/app/_components/ui/alert-dialog";
import { Skeleton } from "@/app/_components/ui/skeleton";

export interface CollectionLoanType extends Loan {
  loanedBy: { name: string } | null;
}

const CollectionPage: React.FC<{
  allSemesters: { name: string }[];
}> = ({ allSemesters }) => {
  const { data, refetch } = api.loanRequest.getLoansForCollection.useQuery();

  const { toast } = useToast();
  const router = useRouter();
  const [openCollectDialog, setOpenCollectDialog] = useState<boolean>(false);
  const [preperationId, setPreparationId] = useState<string>("");
  // const [loanPendingApprovalData, setLoanPendingApprovalData] = useState()
  const onView = useCallback((loanDetails: Loan) => {
    router.push(`/equipment-loans/loans/${loanDetails.id}`);
  }, []);
  const onCollect = useCallback((loanDetails: Loan) => {
    setPreparationId(loanDetails.id);
    setOpenCollectDialog(true);
  }, []);

  const CollectionTableColumns = useMemo(
    () => CollectionColumns({ onView, onCollect }),
    [],
  );

  return (
    <div className="rounded-lg bg-white p-5 shadow-lg">
      <AlertDialog open={openCollectDialog}>
        <AlertDialogContent className=" h-3/4 w-11/12 max-w-none">
          <CollectionLoanDialog
            closeDialog={() => {
              setOpenCollectDialog(false);
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
        <CollectionDataTable
          columns={CollectionTableColumns}
          data={data}
          allSemesters={allSemesters}
        />
      )}
    </div>
  );
};

export default CollectionPage;
