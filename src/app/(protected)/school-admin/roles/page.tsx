import React from "react";
import { api } from "@/trpc/server";

const page = async () => {

  const data = await api.schoolAdmin.getAllRoles();

  return (
    <div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Roles
      </h3>
      <div>

      </div>
    </div>
  );
};

export default page;
