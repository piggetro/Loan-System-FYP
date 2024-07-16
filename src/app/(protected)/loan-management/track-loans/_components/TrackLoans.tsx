/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { api } from "@/trpc/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { useToast } from "@/app/_components/ui/use-toast";
import { PreparationColumns } from "./TrackLoansColumns";
import { TrackLoansDataTable } from "./TrackLoansDataTable";
import { Skeleton } from "@/app/_components/ui/skeleton";

import {
  AlertDialog,
  AlertDialogContent,
} from "@/app/_components/ui/alert-dialog";
import ReturnLoanDialog from "../../_components/ReturnLoanDialog";
import { type LoanStatus } from "@/db/enums";
import { Input } from "@/app/_components/ui/input";

export interface TrackLoansType {
  id: string;
  loanId: string;
  remarks: string;
  dueDate: Date;
  status: string;
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
  waiverId: string | null;
  loanedBy: { name: string } | null;
}

const TrackLoansPage: React.FC<{ allSemesters: { name: string }[] }> = ({
  allSemesters,
}) => {
  const { data: data, mutateAsync: fetchSearch } =
    api.loanRequest.searchLoans.useMutation();
  const [debouncerIsLoading, setDebouncerIsLoading] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");

  const { toast } = useToast();
  const router = useRouter();
  const [openReturnDialog, setOpenReturnDialog] = useState<boolean>(false);
  const [returnId, setReturnId] = useState<string>("");

  //debouncer
  useEffect(() => {
    setDebouncerIsLoading(true);
    const timeout = setTimeout(() => {
      if (searchInput !== "") {
        fetchSearch({ searchInput: searchInput })
          .then(() => {
            setDebouncerIsLoading(false);
          })
          .catch((e) => console.log(e));
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const onView = useCallback((loanDetails: TrackLoansType) => {
    router.push(`/equipment-loans/loans/${loanDetails.id}`);
  }, []);

  const PreparationTableColumns = useMemo(
    () => PreparationColumns({ onView }),
    [],
  );

  return (
    <div className="rounded-lg bg-white p-5 shadow-lg">
      <div>
        <div>
          <p className="mb-2 font-semibold">Search Loans</p>
        </div>
        <Input
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
          }}
          placeholder="Search Loan ID/Borrower Name"
        />

        <TrackLoansDataTable
          columns={PreparationTableColumns}
          data={data!}
          allSemesters={allSemesters}
          searchInput={searchInput}
          debouncerIsLoading={debouncerIsLoading}
        />
      </div>
    </div>
  );
};

export default TrackLoansPage;
