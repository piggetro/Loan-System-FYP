import TopHeaderComponent from "@/app/_components/TopHeader";
import React from 'react';


const page = () => {
  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Management / General Settings"
        pageName="General Settings"
      />
    </div>
  );
}

export default page;