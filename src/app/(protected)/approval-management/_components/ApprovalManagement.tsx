/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  ApprovalManagementColumns,
  ApprovalManagementHistoryColumns,
} from "./ApprovalManagementColumns";

import { z } from "zod";
import {
  ApprovalManagementHistoryTable,
  ApprovalManagementTable,
} from "./ApprovalManagementDatatable";
import { type ApprovalManagementType } from "../page";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useToast } from "@/app/_components/ui/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import AddStaff from "../../school-admin/staff/_components/AddStaff";
import StaffTable from "../../school-admin/staff/_components/StaffTable";

const formSchema = z.object({
  remarks: z.string().min(2).max(50),
  returnDate: z.string().date(),
});

const ApprovalManagementComponent: React.FC<{
  loanRequests: ApprovalManagementType[];
  loanRequestHistory: ApprovalManagementType[];
}> = ({ loanRequests, loanRequestHistory }) => {
  const [loanRequestsData, setLoanRequestsData] =
    useState<ApprovalManagementType[]>(loanRequests);
  const router = useRouter();
  const { toast } = useToast();
  const approveRequest = api.loanRequest.approveLoanRequest.useMutation();

  const [approveRequestHistoryData, setApproveRequestHistoryData] =
    useState<ApprovalManagementType[]>(loanRequestHistory);

  function removeLoan(loanId: string) {
    setLoanRequestsData((loanData) =>
      loanData.filter((s, i) => s.loanId != loanId),
    );
  }

  const onView = useCallback((loanDetails: ApprovalManagementType) => {
    router.push("/approval-management/hello");
  }, []);

  const onApprove = useCallback((loanDetails: ApprovalManagementType) => {
    approveRequest
      .mutateAsync({
        loanId: loanDetails.loanId,
      })
      .then((results) => {
        toast({
          title: "Loan has been approved",
          description: `Loan ${loanDetails.loanId} has been approved`,
        });

        removeLoan(loanDetails.loanId);
        loanDetails.status = "APPROVED";
        setApproveRequestHistoryData((prev) => [...prev, loanDetails]);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  const onReject = useCallback((loanDetails: ApprovalManagementType) => {
    console.log("onreject");
  }, []);

  const TableColumns = useMemo(
    () => ApprovalManagementColumns({ onView, onApprove, onReject }),
    [],
  );
  const TableColumnsHistory = useMemo(
    () => ApprovalManagementHistoryColumns({ onView }),
    [],
  );
  return (
    <div className="bg-white">
      <Tabs defaultValue="loanApprovals" className="mt-4">
        <div className="mt-2 rounded-md bg-white px-6 py-4">
          <TabsList className="mb-2">
            <TabsTrigger value="loanApprovals">Loan Approvals</TabsTrigger>
            <TabsTrigger value="approvalHistory">Approval History</TabsTrigger>
          </TabsList>
          <TabsContent value="loanApprovals">
            <ApprovalManagementTable
              data={loanRequestsData}
              columns={TableColumns}
            />
          </TabsContent>
          <TabsContent value="approvalHistory" className="flex-1">
            <ApprovalManagementHistoryTable
              data={approveRequestHistoryData}
              columns={TableColumnsHistory}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ApprovalManagementComponent;
