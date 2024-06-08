import React from "react";
import { api } from "@/trpc/server";
import AccessRight from "./_components/AccessRight";
import TopHeaderComponent from "@/app/_components/TopHeader";

const page = async () => {
  const data = await api.schoolAdmin.getAccessRights();

  return (
    <div>
      <TopHeaderComponent
        pathName="School Admin / Access Rights"
        pageName="Access Rights"
      />
      <div>
        <AccessRight data={data} />
      </div>
    </div>
  );
};

export default page;
