"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import { type Staff } from "./StaffColumns";
import StaffTable from "./StaffTable";
import AddStaff, { OrganizationUnit, Role, StaffType } from "./AddStaff";

interface StaffProps {
  staff: Staff[];
  organizationUnits: OrganizationUnit[];
  staffTypes: StaffType[];
  roles: Role[];
}

const Staff = ({
  staff: data,
  organizationUnits,
  staffTypes,
  roles,
}: StaffProps) => {
  const [staff, setStaff] = useState<Staff[]>(data);

  return (
    <Tabs defaultValue="staff" className="mt-4">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <TabsList className="mb-2">
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="addStaff">Add Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="staff">
          <StaffTable staff={staff} setStaff={setStaff} />
        </TabsContent>
        <TabsContent value="addStaff" className="flex-1">
          <AddStaff
            setStaff={setStaff}
            organizationUnits={organizationUnits}
            staffTypes={staffTypes}
            roles={roles}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default Staff;
