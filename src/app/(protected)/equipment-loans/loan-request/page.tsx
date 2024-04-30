import React from "react";
import TopHeaderComponent from "./_components/TopHeader";
import LoanRequestComponent from "./_components/LoanRequest";

const LoanRequestPage = () => {
  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Loans / Loans Request"
        pageName="Loan Request"
      />
      <LoanRequestComponent />
    </div>
  );
};

export default LoanRequestPage;
