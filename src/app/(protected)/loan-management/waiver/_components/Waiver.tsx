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
  loanRequestHistory: WaiverType[];
  allSemesters: { name: string }[];
}> = ({ loanRequests, loanRequestHistory, allSemesters }) => {
  const [loanRequestsData, setLoanRequestsData] =
    useState<WaiverType[]>(loanRequests);
  const router = useRouter();

  const onView = useCallback((waiverDetails: WaiverType) => {
    router.push(`/loan-management/waiver/${waiverDetails.loan_id}`);
  }, []);

  const TableColumns = useMemo(() => WaiverColumns({ onView }), []);
  const TableColumnsHistory = useMemo(
    () => WaiverHistoryColumns({ onView }),
    [],
  );
  return (
    <div className="bg-white">
      <Tabs defaultValue="loanApprovals" className="mt-4">
        <div className="mt-2 rounded-md bg-white px-6 py-4">
          <TabsList className="mb-2">
            <TabsTrigger value="loanApprovals">Pending Waivers</TabsTrigger>
            <TabsTrigger value="approvalHistory">Waiver History</TabsTrigger>
          </TabsList>
          <TabsContent value="loanApprovals">
            <WaiverTable
              data={loanRequestsData}
              columns={TableColumns}
              allSemesters={allSemesters}
            />
          </TabsContent>
          <TabsContent value="approvalHistory" className="flex-1">
            <WaiverHistoryTable
              data={loanRequestHistory}
              columns={TableColumnsHistory}
              allSemesters={allSemesters}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default WaiverComponent;
