import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";

interface RolesProps {
  roles: RolesProps[];
}

const Roles = ({}: RolesProps) => {
  return (
    <Tabs defaultValue="AccessRightTable" className="mt-4">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <TabsList className="mb-2">
          <TabsTrigger value="AccessRightTable">Access Rights</TabsTrigger>
          <TabsTrigger value="AddAccessRight">Add Access Right</TabsTrigger>
        </TabsList>
        <TabsContent value="AccessRightTable">
          <AccessRightTable
            accessRights={accessRights}
            setAccessRights={setAccessRights}
          />
        </TabsContent>
        <TabsContent value="AddAccessRight" className="flex-1">
          <AddAccessRight setAccessRights={setAccessRights} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default Roles;
