import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import PreparationPage from "./_components/Return";
import { api } from "@/trpc/server";

const page = async () => {
  const allSemesters = await api.loan.getSemesters();
  return (
    <div>
      <TopHeaderComponent
        pageName="Return"
        pathName="Loan Management / Return"
      />
      <PreparationPage allSemesters={allSemesters} />
    </div>
  );
};

export default page;
