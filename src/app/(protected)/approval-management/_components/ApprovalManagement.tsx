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
import { Skeleton } from "@/app/_components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

const ApprovalManagementComponent: React.FC<{
  allSemesters: { name: string }[];
}> = ({ allSemesters }) => {
  const [openApprovalDialog, setOpenApprovalDialog] = useState<boolean>(false);
  const [approveLoanId, setApproveLoanId] = useState<string>();
  const [rejectLoanId, setRejectLoanId] = useState<string>();
  const [rejectLoanIdForUser, setRejectLoanIdForUser] = useState<string>();
  const [openRejectLoanDialog, setOpenRejectLoanDialog] =
    useState<boolean>(false);
  const [isActionButtonPending, setIsActionButtonPending] =
    useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();
  const { data: approvalLoanRequest, refetch: approvalLoanRequestRefetch } =
    api.loanRequest.getUserApprovalManagementLoanRequests.useQuery();
  const {
    data: approvalLoanRequestHistory,
    refetch: approvalLoanRequestHistoryRefetch,
  } = api.loanRequest.getUserApprovalManagementLoanHistory.useQuery();

  const rejectRequest = api.loanRequest.rejectLoanRequest.useMutation();

  function refresh() {
    approvalLoanRequestRefetch().catch(() => {
      toast({
        title: "Something unexepected happened",
        variant: "destructive",
      });
    });
    approvalLoanRequestHistoryRefetch().catch(() => {
      toast({
        title: "Something unexepected happened",
        variant: "destructive",
      });
    });
  }

  function closeDialogOnSuccess() {
    setOpenApprovalDialog(false);
    refresh();
  }

  const onView = useCallback((loanDetails: ApprovalManagementType) => {
    router.push(
      `/equipment-loans/loans/${loanDetails.id}?prev=approval-management`,
    );
  }, []);

  const onApprove = useCallback((loanDetails: ApprovalManagementType) => {
    setApproveLoanId(loanDetails.id);
    setOpenApprovalDialog(true);
  }, []);

  const onReject = useCallback((loanDetails: ApprovalManagementType) => {
    setRejectLoanId(loanDetails.id);
    setRejectLoanIdForUser(loanDetails.loanId);
    setOpenRejectLoanDialog(true);
  }, []);

  const executeRejectLoan = () => {
    setIsActionButtonPending(true);
    rejectRequest
      .mutateAsync({ id: rejectLoanId! })
      .then(() => {
        toast({
          title: "Loan has been rejected",
          description: `Loan has been rejected`,
        });
        setRejectLoanId(undefined);
        setRejectLoanIdForUser(undefined);
        setOpenRejectLoanDialog(false);
        setIsActionButtonPending(false);
        refresh();
      })
      .catch(() => {
        toast({
          title: "An unexpected error occured. Please try again later",
          variant: "destructive",
        });
        setRejectLoanId(undefined);
        setRejectLoanIdForUser(undefined);
        setIsActionButtonPending(false);
      });
  };

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

      {rejectLoanId !== undefined ? (
        <AlertDialog
          open={openRejectLoanDialog}
          onOpenChange={setOpenRejectLoanDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will reject the Loan Request.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setOpenRejectLoanDialog(false);
                }}
                disabled={isActionButtonPending}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  executeRejectLoan();
                }}
                disabled={isActionButtonPending}
              >
                Reject
                {isActionButtonPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}

      <Tabs defaultValue="loanApprovals" className="mt-4">
        <div className="mt-2 rounded-md bg-white px-6 py-4">
          <TabsList className="mb-2">
            <TabsTrigger value="loanApprovals">Loan Approvals</TabsTrigger>
            <TabsTrigger value="approvalHistory">Approval History</TabsTrigger>
          </TabsList>
          <TabsContent value="loanApprovals">
            {approvalLoanRequest === undefined ||
            approvalLoanRequest === null ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-7 w-1/2" />
                <Skeleton className="h-96 w-full" />
              </div>
            ) : (
              <ApprovalManagementTable
                data={approvalLoanRequest}
                columns={TableColumns}
                allSemesters={allSemesters}
              />
            )}
          </TabsContent>
          <TabsContent value="approvalHistory" className="flex-1">
            {approvalLoanRequestHistory === undefined ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-7 w-1/3" />
                <Skeleton className="h-7 w-1/2" />
                <Skeleton className="h-96 w-full" />
              </div>
            ) : (
              <ApprovalManagementHistoryTable
                data={approvalLoanRequestHistory}
                columns={TableColumnsHistory}
                allSemesters={allSemesters}
              />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ApprovalManagementComponent;
