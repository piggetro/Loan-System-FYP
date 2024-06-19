import TopHeaderComponent from "@/app/_components/TopHeader";
import React from 'react';
import { api } from "@/trpc/server";
import StaffType from "./_components/StaffType";

const page = async () => {
  const data = await api.staffTypes.getAllStaffTypes();

  return (
    <div>
      <TopHeaderComponent
        pathName="School Admin / Staff Types"
        pageName="Staff Types"
      />
      <StaffType data={data} />
    </div>
  );
};

export default page;
