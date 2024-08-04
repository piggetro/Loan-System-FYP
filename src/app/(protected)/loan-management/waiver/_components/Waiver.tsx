/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import React, { useCallback, useMemo, useState } from "react";
import { WaiverColumns, WaiverHistoryColumns } from "./WaiverColumns";

import { WaiverHistoryTable, WaiverTable } from "./WaiverDatatable";
import { type WaiverType } from "../page";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useToast } from "@/app/_components/ui/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";

const WaiverComponent: React.FC<{
  loanRequests: WaiverType[];
  allSemesters: { name: string }[];
}> = ({ loanRequests, allSemesters }) => {
  const [loanRequestsData, setLoanRequestsData] =
    useState<WaiverType[]>(loanRequests);
  const router = useRouter();
  const isUserOwnLoad = api.loanRequest.checkIfUsersOwnLoan.useMutation();
  const { toast } = useToast();
  const onView = useCallback((waiverDetails: WaiverType) => {
    if (waiverDetails.id !== null) {
      isUserOwnLoad
        .mutateAsync({ id: waiverDetails.id })
        .then((results) => {
          if (results) {
            router.push(
              `/equipment-loans/waiver/${waiverDetails.id}?prev=waiver`,
            );
          } else {
            router.push(`/loan-management/waiver/${waiverDetails.id}`);
          }
        })
        .catch(() => {
          toast({
            title: "An error occurred. Please try again later.",
            variant: "destructive",
          });
        });
    } else {
      toast({
        title: "An error occurred. Please try again later.",
        variant: "destructive",
      });
    }
  }, []);

  const TableColumns = useMemo(() => WaiverColumns({ onView }), []);

  return (
    <div className="rounded-lg bg-white p-5 shadow-lg">
      <WaiverTable
        data={loanRequestsData}
        columns={TableColumns}
        allSemesters={allSemesters}
      />
    </div>
  );
};

export default WaiverComponent;
