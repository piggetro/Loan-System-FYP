import React from "react";
import StaffDetails from "./_components/StaffDetails";
import { api } from "@/trpc/server";

interface pageProps {
  params: { staffId: string };
}

const page = async ({ params }: pageProps) => {
  const [staff, organizationUnits, staffTypes, roles, accessRights] =
    await Promise.all([
      api.schoolAdmin.getStaff({ id: params.staffId }),
      api.schoolAdmin.getAllOrganizationUnits(),
      api.schoolAdmin.getAllStaffTypes(),
      api.schoolAdmin.getAllRoles(),
      api.schoolAdmin.getStaffAccessRights({ id: params.staffId }),
    ]);
  return (
    <div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Staff Details
      </h3>
      <div>
        <StaffDetails
          staff={staff}
          accessRights={accessRights}
          organizationUnits={organizationUnits}
          staffTypes={staffTypes}
          roles={roles}
        />
      </div>
    </div>
  );
};

export default page;
