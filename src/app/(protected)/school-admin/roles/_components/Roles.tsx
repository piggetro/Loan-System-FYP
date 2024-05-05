"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import { type Roles } from "./RolesColumns";
import RolesTable from "./RolesTable";
import { AccessRights } from "../../../../_components/AddAccessRightColumns";
import AddRole from "./AddRole";

interface RolesProps {
  roles: Roles[];
  accessRights: AccessRights[];
}

const Roles = ({ roles: data, accessRights }: RolesProps) => {
  const [roles, setRoles] = useState<Roles[]>(data);

  return (
    <Tabs defaultValue="roles" className="mt-4">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <TabsList className="mb-2">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="addRoles">Add Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="roles">
          <RolesTable roles={roles} setRoles={setRoles} />
        </TabsContent>
        <TabsContent value="addRoles" className="flex-1">
          <AddRole setRoles={setRoles} accessRights={accessRights} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default Roles;
