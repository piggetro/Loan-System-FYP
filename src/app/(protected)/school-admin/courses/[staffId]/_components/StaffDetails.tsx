"use client";

import React, { useCallback, useMemo, useState } from "react";
import { AccessRights, accessRightColumns } from "./AccessRightColumns";
import StaffInfo, {
  OrganizationUnit,
  Role,
  Staff,
  StaffType,
} from "./StaffInfo";
import { Separator } from "@/app/_components/ui/separator";
import { AccessRightDataTable } from "./AccessRightDataTable";
import DeleteAccessRight from "./DeleteAccessRight";
import AddAccessRight from "./AddAccessRight";
import { Button } from "@/app/_components/ui/button";

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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [accessRights, setAccessRights] =
    useState<AccessRights[]>(dataAccessRights);

  const [selectedAccessRight, setSelectedAccessRight] =
    useState<AccessRights | null>(null);

  const onDelete = useCallback((accessRight: AccessRights) => {
    setSelectedAccessRight(accessRight);
    setIsDeleteDialogOpen(true);
  }, []);

  const TableColumns = useMemo(() => accessRightColumns({ onDelete }), []);

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
      <Separator className="my-3" />
      <AddAccessRight
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        setAccessRights={setAccessRights}
        staffId={staff.id}
      />
      <DeleteAccessRight
        accessRight={selectedAccessRight}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        setAccessRghts={setAccessRights}
        staffId={staff.id}
      />
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Access Rights</h3>
        <Button onClick={() => setIsDialogOpen(true)}>Grant More Access Rights</Button>
      </div>
      <AccessRightDataTable data={accessRights} columns={TableColumns} />
    </div>
  );
};

export default StaffDetails;
