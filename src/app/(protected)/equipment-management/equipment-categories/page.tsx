import TopHeaderComponent from "@/app/_components/TopHeader";
import React from 'react';


const page = () => {
  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Management / Equipment Categories"
        pageName="Equipment Categories"
      />
    </div>
  );
}

export default page;