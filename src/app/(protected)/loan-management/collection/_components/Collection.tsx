/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { api } from "@/trpc/react";
import React, { useCallback, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { useToast } from "@/app/_components/ui/use-toast";
import { CollectionColumns } from "./CollectionColumns";
import { CollectionDataTable } from "./CollectionDataTable";
import CollectionLoanDialog from "../../_components/CollectionLoanDialog";
import { Skeleton } from "@/app/_components/ui/skeleton";
import { type LoanStatus } from "@/db/enums";
import { Dialog, DialogContent } from "@/app/_components/ui/dialog";

export interface CollectionLoanType {
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

const CollectionPage: React.FC<{
  allSemesters: { name: string }[];
}> = ({ allSemesters }) => {
  const { data, refetch } = api.loanRequest.getLoansForCollection.useQuery();
  const isUserOwnLoad = api.loanRequest.checkIfUsersOwnLoan.useMutation();

  const { toast } = useToast();
  const router = useRouter();
  const [openCollectDialog, setOpenCollectDialog] = useState<boolean>(false);
  const [preperationId, setPreparationId] = useState<string>("");
  // const [loanPendingApprovalData, setLoanPendingApprovalData] = useState()
  const onView = useCallback((loanDetails: CollectionLoanType) => {
    router.push(`/equipment-loans/loans/${loanDetails.id}?prev=collection`);
  }, []);
  const onCollect = useCallback((loanDetails: CollectionLoanType) => {
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
          setPreparationId(loanDetails.id);
          setOpenCollectDialog(true);
        }
      })
      .catch(() => {
        toast({
          title: "An error occurred. Please try again later.",
          variant: "destructive",
        });
      });
  }, []);

  const CollectionTableColumns = useMemo(
    () => CollectionColumns({ onView, onCollect }),
    [],
  );

  return (
    <div className="rounded-lg bg-white p-5 shadow-lg">
      <Dialog open={openCollectDialog} onOpenChange={setOpenCollectDialog}>
        <DialogContent className=" h-3/4 w-11/12 max-w-none">
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
        </DialogContent>
      </Dialog>
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
