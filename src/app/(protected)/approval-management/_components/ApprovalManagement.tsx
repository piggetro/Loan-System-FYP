/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  ApprovalManagementColumns,
  ApprovalManagementHistoryColumns,
} from "./ApprovalManagementColumns";

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
import ApprovalLoanDialog from "../../loan-management/_components/ApprovalLoanDialog";

const ApprovalManagementComponent: React.FC<{
  loanRequests: ApprovalManagementType[];
  loanRequestHistory: ApprovalManagementType[];
  allSemesters: { name: string }[];
}> = ({ loanRequests, loanRequestHistory, allSemesters }) => {
  const [loanRequestsData, setLoanRequestsData] =
    useState<ApprovalManagementType[]>(loanRequests);
  const [openApprovalDialog, setOpenApprovalDialog] = useState<boolean>(false);
  const [approveLoanId, setApproveLoanId] = useState<string>();
  const router = useRouter();
  const { toast } = useToast();
  const approveRequest =
    api.loanRequest.approveLoanRequestWithLoanId.useMutation();
  const rejectRequest = api.loanRequest.rejectLoanRequest.useMutation();
  const [approveRequestHistoryData, setApproveRequestHistoryData] =
    useState<ApprovalManagementType[]>(loanRequestHistory);

  function removeLoan(loanId: string) {
    setLoanRequestsData((loanData) =>
      loanData.filter((s) => s.loanId != loanId),
    );
  }

  function closeDialogOnSuccess() {
    setOpenApprovalDialog(false);
    removeLoan(approveLoanId!);
  }

  const onView = useCallback((loanDetails: ApprovalManagementType) => {
    router.push(
      `/equipment-loans/loans/${loanDetails.id}?prev=approval-management`,
    );
  }, []);

  const onApprove = useCallback((loanDetails: ApprovalManagementType) => {
    setApproveLoanId(loanDetails.id);
    setOpenApprovalDialog(true);
    // approveRequest
    //   .mutateAsync({
    //     loanId: loanDetails.loanId,
    //   })
    //   .then(() => {
    //     toast({
    //       title: "Loan has been approved",
    //       description: `Loan ${loanDetails.loanId} has been approved`,
    //     });

    //     //Updating frontend for UX
    //     removeLoan(loanDetails.loanId);
    //     loanDetails.status = "REQUEST_COLLECTION";
    //     setApproveRequestHistoryData((prev) => [...prev, loanDetails]);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  }, []);

  const onReject = useCallback((loanDetails: ApprovalManagementType) => {
    //Derricks part, use api.loanRequest.rejectLoanRequest
    rejectRequest
      .mutateAsync({ id: loanDetails.id })
      .then(() => {
        toast({
          title: "Loan has been rejected",
          description: `Loan ${loanDetails.loanId} has been rejected`,
        });
        //Updating frontend for UX
        removeLoan(loanDetails.loanId);
        loanDetails.status = "REJECTED";
        setApproveRequestHistoryData((prev) => [...prev, loanDetails]);
      })
      .catch(() => {
        toast({
          title: "Something Unexpected Happened",
          description: `Contact Help Desk for assistance`,
        });
      });
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
      {approveLoanId !== undefined ? (
        <ApprovalLoanDialog
          successCloseDialog={closeDialogOnSuccess}
          id={approveLoanId}
          isDialogOpen={openApprovalDialog}
          setIsDialogOpen={setOpenApprovalDialog}
        />
      ) : null}

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
              allSemesters={allSemesters}
            />
          </TabsContent>
          <TabsContent value="approvalHistory" className="flex-1">
            <ApprovalManagementHistoryTable
              data={approveRequestHistoryData}
              columns={TableColumnsHistory}
              allSemesters={allSemesters}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ApprovalManagementComponent;
