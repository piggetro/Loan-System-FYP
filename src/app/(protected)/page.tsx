import React from "react";
import TopHeaderComponent from "../_components/TopHeader";
import { api } from "@/trpc/server";
import Dashboard from "./_components/Dashboard";

const page = async () => {
  const [currentLoans, overdueLoans] = await Promise.all([
    api.user.getUserCurrentLoans(),
    api.user.getUserOverdueLoans(),
  ]);

  return (
    <div>
      <TopHeaderComponent
        pathName="Dashboard"
        pageName="Welcome to School Of Computing Loan System"
      />
      <Dashboard currentLoans={currentLoans} overdueLoans={overdueLoans} />
    </div>
  );
};

export default page;
