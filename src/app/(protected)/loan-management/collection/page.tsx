import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { PreparationDataTable } from "./_components/PreparationDataTable";
import PreparationPage from "./_components/Preparation";
import { api } from "@/trpc/server";

const page = async () => {
  const allSemesters = await api.loan.getSemesters();
  return (
    <div>
      <TopHeaderComponent
        pageName="Preparation"
        pathName="Loan Management / Preparation"
      />
      <PreparationPage allSemesters={allSemesters} />
    </div>
  );
};

export default page;
