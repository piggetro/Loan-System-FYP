import TopHeaderComponent from "@/app/_components/TopHeader";
import React from 'react';


const page = () => {
  return (
    <div>
      <TopHeaderComponent
        pathName="Home"
        pageName="Dashboard"
      />
    </div>
  );
}

export default page;