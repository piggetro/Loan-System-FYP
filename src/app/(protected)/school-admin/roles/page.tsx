import React from "react";
import { api } from "@/trpc/server";
import Roles from "./_components/Roles";

const page = async () => {

  const data = await api.schoolAdmin.getAllRoles();
  const accessRights = await api.schoolAdmin.getAccessRights();

  return (
    <div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Roles
      </h3>
      <div>
        <Roles roles={data} accessRights={accessRights} />
      </div>
    </div>
  );
};

export default page;
