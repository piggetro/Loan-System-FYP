import TopHeaderComponent from "@/app/_components/TopHeader";
import React from 'react';


const page = () => {
  return (
    <div>
      <TopHeaderComponent
        pathName="Loan Management / Lost/Broken Loans"
        pageName="Lost/Broken Loans"
      />
    </div>
  );
}

export default page;