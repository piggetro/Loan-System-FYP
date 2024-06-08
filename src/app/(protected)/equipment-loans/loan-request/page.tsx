import React from "react";
import TopHeaderComponent from "../../../_components/TopHeader";
import LoanRequestComponent from "./_components/LoanRequest";
import { api } from "@/trpc/server";

export type Inventory = {
  equipmentId: string;
  itemDescription: string;
  category: string;
  subCategory: string;
  quantityAvailable: number;
  quantitySelected: number;
};

const LoanRequestPage = async () => {
  const categoriesAndSubCategories = await api.loanRequest.getCategories();
  const approvingLecturers = await api.loanRequest.getApprovingLecturers();

  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Loans / Loans Request"
        pageName="Loan Request"
      />
      <LoanRequestComponent
        categoriesAndSubCategories={categoriesAndSubCategories}
        approvingLecturers={approvingLecturers}
      />
    </div>
  );
};

export default LoanRequestPage;
