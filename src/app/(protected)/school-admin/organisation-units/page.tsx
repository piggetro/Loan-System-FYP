import TopHeaderComponent from "@/app/_components/TopHeader";
import React from 'react';
import { api } from "@/trpc/server";
import OrganizationUnit from "./_components/OrganizationUnit";

const page = async () => {
  const data = await api.organisationUnits.getAllOrganizationUnits();

  return (
    <div>
      <TopHeaderComponent
        pathName="School Admin / Organization Units"
        pageName="Organization Units"
      />
      <OrganizationUnit data={data} />
    </div>
  );
};

export default page;
