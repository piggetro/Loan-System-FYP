import React from "react";
import { api } from "@/trpc/server";
import Staff from "./_components/Staff";
import TopHeaderComponent from "@/app/_components/TopHeader";

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
      <div>
        <Staff
          staff={staff}
          organizationUnits={organizationUnits}
          staffTypes={staffTypes}
          roles={roles}
        />
      </div>
    </div>
  );
};

export default page;
