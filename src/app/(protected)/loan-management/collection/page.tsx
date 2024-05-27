import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import CollectionPage from "./_components/Collection";

const page = async () => {
  const allSemesters = await api.loan.getSemesters();
  return (
    <div>
      <TopHeaderComponent
        pageName="Collection"
        pathName="Loan Management / Collection"
      />
      <CollectionPage allSemesters={allSemesters} />
    </div>
  );
};

export default page;
