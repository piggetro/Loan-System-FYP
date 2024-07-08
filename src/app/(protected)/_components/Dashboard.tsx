"use client";

import React, { useCallback, useMemo } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import { CurrentLoans, currentLoansColumns } from "./CurrentLoansColumns";
import { OverdueLoans, overdueLoansColumns } from "./OverdueLoansColumns";
import { useRouter } from "next/navigation";
import { LoanDataTable } from "./LoanDataTable";

interface DashboardProps {
  currentLoans: CurrentLoans[];
  overdueLoans: OverdueLoans[];
}

const Dashboard = ({ currentLoans, overdueLoans }: DashboardProps) => {
  const router = useRouter();

  const onViewCurrent = useCallback((loan: CurrentLoans) => {
    router.push(`/school-admin/student/${loan.id}`);
  }, []);
  const onViewOverdue = useCallback((loan: OverdueLoans) => {
    router.push(`/school-admin/student/${loan.id}`);
  }, []);

  const CurrentColumns = useMemo(
    () => currentLoansColumns({ onView: onViewCurrent }),
    [],
  );

  const OverdueColumns = useMemo(
    () => overdueLoansColumns({ onView: onViewOverdue }),
    [],
  );

  return (
    <Tabs defaultValue="current" className="mt-4">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <TabsList className="mb-2">
          <TabsTrigger value="current">Current Loans</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Loans</TabsTrigger>
        </TabsList>
        <TabsContent value="current">
          <LoanDataTable data={currentLoans} columns={CurrentColumns} />
        </TabsContent>
        <TabsContent value="overdue" className="flex-1">
          <LoanDataTable data={overdueLoans} columns={OverdueColumns} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default Dashboard;
