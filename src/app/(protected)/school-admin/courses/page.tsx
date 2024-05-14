import TopHeaderComponent from "@/app/_components/TopHeader";
import React from 'react';


const page = () => {
  return (
    <div>
      <TopHeaderComponent
        pathName="School Admin / Courses"
        pageName="Courses"
      />
    </div>
  );
}

export default page;