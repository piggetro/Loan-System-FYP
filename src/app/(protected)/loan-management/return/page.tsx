import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import ReturnPage from "./_components/Return";
import { api } from "@/trpc/server";

const page = async () => {
  const allSemesters = await api.loan.getSemesters();
  return (
    <div>
      <TopHeaderComponent
        pageName="Return"
        pathName="Loan Management / Return"
      />
      <ReturnPage allSemesters={allSemesters} />
    </div>
  );
};

export default page;
