import React from "react";
import AccessRight from "./_components/AccessRight";
import { api } from "@/trpc/server";

const page = async () => {
  const data = await api.schoolAdmin.getAccessRights();

  return (
    <div>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
        Access Rights
      </h4>
      <div className="mt-5 h-fit rounded-md bg-white p-4">
        <AccessRight data={data} />
      </div>
    </div>
  );
};

export default page;
