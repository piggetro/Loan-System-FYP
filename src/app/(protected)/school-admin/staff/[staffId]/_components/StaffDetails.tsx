"use client";

import React, { useEffect, useState } from "react";
import { AccessRights } from "./AccessRightColumns";
import StaffInfo, {
  OrganizationUnit,
  Role,
  Staff,
  StaffType,
} from "./StaffInfo";

interface StaffDetailsProps {
  staff: Staff;
  organizationUnits: OrganizationUnit[];
  staffTypes: StaffType[];
  roles: Role[];
  accessRights: AccessRights[];
}

const StaffDetails = ({
  staff: data,
  accessRights: dataAccessRights,
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
  const [accessRights, setAccessRights] =
    useState<AccessRights[]>(dataAccessRights);

  return (
    <div className="mt-6 rounded-md bg-white px-6 py-4">
      <StaffInfo
        staff={staff}
        setStaff={setStaff}
        setAccessRights={setAccessRights}
        organizationUnits={organizationUnits}
        staffTypes={staffTypes}
        roles={roles}
      />
    </div>
  );
};

export default StaffDetails;
