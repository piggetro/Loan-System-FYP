import React from 'react';
import { api } from "@/trpc/server";
import OrganizationUnit from "./_components/OrganizationUnit";

const page = async () => {
  const data = await api.schoolAdmin.getAllOrganizationUnits();

  return (
    <div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Organization Units
      </h3>
      <div>
        <OrganizationUnit data={data} />
      </div>
    </div>
  );
};

export default page;
