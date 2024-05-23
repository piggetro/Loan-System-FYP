import TopHeaderComponent from "@/app/_components/TopHeader";
import React from 'react';


const page = () => {
  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Loans / Overdue Loans"
        pageName="Overdue Loans"
      />
    </div>
  );
}

export default page;