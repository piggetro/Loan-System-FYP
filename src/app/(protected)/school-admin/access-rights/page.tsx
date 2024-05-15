import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import AccessRight from "./_components/AccessRight";

const page = async () => {
  const data = await api.schoolAdmin.getAccessRights();

  return (
    <div>
      <TopHeaderComponent
        pathName="School Admin / Access Rights"
        pageName="Access Rights"
      />
      <AccessRight data={data} />
    </div>
  );
};

export default page;
