import React from "react";
import StaffDetails from "./_components/StaffDetails";
import { api } from "@/trpc/server";
import TopHeaderComponent from "@/app/_components/TopHeader";

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
      <TopHeaderComponent
        pathName="School Admin / Staff"
        pageName="Staff"
      />
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
