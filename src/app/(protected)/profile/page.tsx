import TopHeaderComponent from "@/app/_components/TopHeader";
import React from 'react';


const page = () => {
  return (
    <div>
      <TopHeaderComponent
        pathName="My Profile"
        pageName="My Profile"
      />
    </div>
  );
}

export default page;