import React from "react";
import { api } from "@/trpc/server";
import Staff from "./_components/Staff";

const page = async () => {
  const staff = await api.schoolAdmin.getAllStaff();
  const organizationUnits = await api.schoolAdmin.getAllOrganizationUnits();
  const staffTypes = await api.schoolAdmin.getAllStaffTypes();
  const roles = await api.schoolAdmin.getAllRoles();

  return (
    <div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Staff
      </h3>
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
