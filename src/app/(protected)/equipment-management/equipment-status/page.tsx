import TopHeaderComponent from "@/app/_components/TopHeader";
import React from 'react';


const page = () => {
  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Management / Equipment Status"
        pageName="Equipment Status"
      />
    </div>
  );
}

export default page;