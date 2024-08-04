"use client";

import React, { useCallback, useMemo } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import { type CurrentLoans, currentLoansColumns } from "./CurrentLoansColumns";
import { type OverdueLoans, overdueLoansColumns } from "./OverdueLoansColumns";
import { useRouter } from "next/navigation";
import { LoanDataTable } from "./LoanDataTable";
import { type HistoryLoans, historyLoansColumns } from "./HistoryLoansColumns";
import {
  approvalLoansColumns,
  type ApprovalLoans,
} from "./ApprovalLoansColumns";

interface DashboardProps {
  currentLoans: CurrentLoans[];
  outstandingLoans: OverdueLoans[];
  historyLoans: HistoryLoans[];
  approvalLoans: ApprovalLoans[] | null;
}

const Dashboard = ({
  currentLoans,
  outstandingLoans,
  historyLoans,
  approvalLoans,
}: DashboardProps) => {
  const router = useRouter();
  const onViewApproval = useCallback((loan: ApprovalLoans) => {
    router.push(`/equipment-loans/loans/${loan.id}?prev=dashboard`);
  }, []);
  const onViewCurrent = useCallback((loan: CurrentLoans) => {
    router.push(`/equipment-loans/loans/${loan.id}?prev=dashboard`);
  }, []);
  const onViewOverdue = useCallback((loan: OverdueLoans) => {
    router.push(`/equipment-loans/loans/${loan.id}?prev=dashboard`);
  }, []);
  const onViewHistory = useCallback((loan: HistoryLoans) => {
    router.push(`/equipment-loans/loans/${loan.id}?prev=dashboard`);
  }, []);

  const ApprovalColumns = useMemo(
    () => approvalLoansColumns({ onView: onViewApproval }),
    [],
  );

  const CurrentColumns = useMemo(
    () => currentLoansColumns({ onView: onViewCurrent }),
    [],
  );

  const OverdueColumns = useMemo(
    () => overdueLoansColumns({ onView: onViewOverdue }),
    [],
  );

  const HistoryColumns = useMemo(
    () => historyLoansColumns({ onView: onViewHistory }),
    [],
  );

  return (
    <Tabs
      defaultValue={approvalLoans ? "approval" : "current"}
      className="mt-4"
    >
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <TabsList className="mb-2">
          {approvalLoans ? (
            <TabsTrigger value="approval">Approval Loans</TabsTrigger>
          ) : null}
          <TabsTrigger value="current">Current Loans</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Loans</TabsTrigger>
          <TabsTrigger value="history">History Loans</TabsTrigger>
        </TabsList>
        {approvalLoans ? (
          <TabsContent value="approval">
            <LoanDataTable data={approvalLoans} columns={ApprovalColumns} />
          </TabsContent>
        ) : null}

        <TabsContent value="current">
          <LoanDataTable data={currentLoans} columns={CurrentColumns} />
        </TabsContent>
        <TabsContent value="overdue" className="flex-1">
          <LoanDataTable data={outstandingLoans} columns={OverdueColumns} />
        </TabsContent>
        <TabsContent value="history" className="flex-1">
          <LoanDataTable data={historyLoans} columns={HistoryColumns} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default Dashboard;
