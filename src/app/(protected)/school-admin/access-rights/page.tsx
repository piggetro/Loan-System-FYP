import React from "react";
import { api } from "@/trpc/server";
import AccessRight from "./_components/AccessRight";

const page = async () => {
  const data = await api.schoolAdmin.getAccessRights();

  return (
    <div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Access Rights
      </h3>
      <div>
        <AccessRight data={data} />
      </div>
    </div>
  );
};

export default page;
