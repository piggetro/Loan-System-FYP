import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import Staff from "./_components/Staff";

const page = async () => {
  const [staff, organizationUnits, staffTypes, roles] = await Promise.all([
    api.schoolAdmin.getAllStaff(),
    api.schoolAdmin.getAllOrganizationUnits(),
    api.schoolAdmin.getAllStaffTypes(),
    api.schoolAdmin.getAllRoles(),
  ]);

  return (
    <div>
      <TopHeaderComponent
        pathName="School Admin / Staff"
        pageName="Staff"
      />
      <Staff
        staff={staff}
        organizationUnits={organizationUnits}
        staffTypes={staffTypes}
        roles={roles}
      />
    </div>
  );
};

export default page;
