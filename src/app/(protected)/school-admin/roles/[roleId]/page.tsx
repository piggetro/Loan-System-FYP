import React from "react";
import { api } from "@/trpc/server";
import RoleDetails from "./_components/RoleDetails";
import TopHeaderComponent from "@/app/_components/TopHeader";

interface pageProps {
  params: { roleId: string };
}

const page = async ({ params }: pageProps) => {
  const role = await api.schoolAdmin.getRoleDetails({ roleId: params.roleId });

  return (
    <div>
      <TopHeaderComponent pathName="School Admin / Roles" pageName="Roles" />
      <div>
        <RoleDetails role={role} />
      </div>
    </div>
  );
};

export default page;
