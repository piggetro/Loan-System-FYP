import React from "react";
import { api } from "@/trpc/server";
import Roles from "./_components/Roles";
import TopHeaderComponent from "@/app/_components/TopHeader";

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
      <div>
        <Roles roles={data} accessRights={accessRights} />
      </div>
    </div>
  );
};

export default page;
