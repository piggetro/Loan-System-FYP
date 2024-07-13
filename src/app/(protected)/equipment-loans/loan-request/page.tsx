import React from "react";
import TopHeaderComponent from "../../../_components/TopHeader";
import LoanRequestComponent from "./_components/LoanRequest";
import { api } from "@/trpc/server";
import UnableToLoanComponent from "./_components/UnableToLoan";

export type Inventory = {
  equipmentId: string;
  itemDescription: string;
  category: string;
  subCategory: string;
  quantityAvailable: number;
  quantitySelected: number;
};

const LoanRequestPage = async () => {
  const userOutstandingLoans = await api.loanRequest.getUserOutstandingLoans();
  const categoriesAndSubCategories = await api.loanRequest.getCategories();
  const approvingLecturers = await api.loanRequest.getApprovingLecturers();

  if (userOutstandingLoans) {
    return (
      <UnableToLoanComponent userOutstandingLoans={userOutstandingLoans} />
    );
  }

  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Loans / Loans Request"
        pageName="Loan Request"
      />

      <LoanRequestComponent
        categoriesAndSubCategories={categoriesAndSubCategories}
        approvers={approvingLecturers}
      />
    </div>
  );
};

export default LoanRequestPage;
