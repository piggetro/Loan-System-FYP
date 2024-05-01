import React from "react";
import { AccessRights } from "./AccessRightColumns";
import { Staff } from "./StaffInfo";

export type StaffDetails = Staff & {
  accessRightsGranted: AccessRights[];
};

interface StaffDetailsProps {
  staff: StaffDetails;
}

const StaffDetails = ({ staff }: StaffDetailsProps) => {
  return <div className="mt-6 rounded-md bg-white px-6 py-4">
    
  </div>;
};

export default StaffDetails;
