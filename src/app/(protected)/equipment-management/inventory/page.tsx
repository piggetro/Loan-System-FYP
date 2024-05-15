import TopHeaderComponent from "@/app/_components/TopHeader";
import React from 'react';


const page = () => {
  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Management / Inventory"
        pageName="Inventory"
      />
    </div>
  );
}

export default page;