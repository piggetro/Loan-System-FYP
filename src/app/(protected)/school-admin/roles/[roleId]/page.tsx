import React from "react";
import { api } from "@/trpc/server";
import RoleDetails from "./_components/RoleDetails";

interface pageProps {
  params: { roleId: string };
}

const page = async ({ params }: pageProps) => {
  const role = await api.schoolAdmin.getRoleDetails({ roleId: params.roleId });

  return (
    <div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Role Details
      </h3>
      <div>
        <RoleDetails role={role} />
      </div>
    </div>
  );
};

export default page;
