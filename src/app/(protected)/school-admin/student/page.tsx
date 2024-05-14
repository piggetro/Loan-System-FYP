import TopHeaderComponent from "@/app/_components/TopHeader";
import React from 'react';


const page = () => {
  return (
    <div>
      <TopHeaderComponent
        pathName="School Admin / Student"
        pageName="Student"
      />
    </div>
  );
}

export default page;