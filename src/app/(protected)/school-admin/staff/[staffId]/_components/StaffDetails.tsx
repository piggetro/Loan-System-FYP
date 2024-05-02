"use client";

import React, { useState } from "react";
import { AccessRights } from "./AccessRightColumns";
import StaffInfo, {
  OrganizationUnit,
  Role,
  Staff,
  StaffType,
} from "./StaffInfo";

export type StaffDetails = Staff & {
  accessRightsGranted: AccessRights[];
};

interface StaffDetailsProps {
  staff: StaffDetails;
  organizationUnits: OrganizationUnit[];
  staffTypes: StaffType[];
  roles: Role[];
}

const StaffDetails = ({
  staff: data,
  organizationUnits,
  staffTypes,
  roles,
}: StaffDetailsProps) => {
  const [staff, setStaff] = useState<Staff>({
    id: data.id,
    mobile: data.mobile,
    email: data.email,
    name: data.name,
    organizationUnit: data.organizationUnit,
    staffType: data.staffType,
    role: data.role,
  });
  console.log(staff);
  return (
    <div className="mt-6 rounded-md bg-white px-6 py-4">
      <StaffInfo
        staff={staff}
        setStaff={setStaff}
        organizationUnits={organizationUnits}
        staffTypes={staffTypes}
        roles={roles}
      />
    </div>
  );
};

export default StaffDetails;
