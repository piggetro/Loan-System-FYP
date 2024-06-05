import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import Roles from "./_components/Roles";

const page = async () => {
  const [data, accessRights] = await Promise.all([
    api.schoolAdmin.getAllRoles(),
    api.schoolAdmin.getAccessRights(),
  ]);

  return (
    <div>
      <TopHeaderComponent
        pathName="School Admin / Roles"
        pageName="Roles"
      />
      <Roles roles={data} accessRights={accessRights} />
    </div>
  );
};

export default page;
