"use client";

import React, { useState } from "react";
import { OrganizationUnits } from "./OrganizationUnitColumns";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import AddOrganizationUnit from "./AddOrganizationUnit";
import OrganizationUnitTable from "./OrganizationUnitTable";

interface OrganizationUnitProps {
  data: OrganizationUnits[];
}

const OrganizationUnit = ({ data }: OrganizationUnitProps) => {
  const [OrganizationUnits, setOrganizationUnits] = useState<OrganizationUnits[]>(data);

  return (
    <Tabs defaultValue="OrganizationUnitTable" className="mt-4">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <TabsList className="mb-2">
          <TabsTrigger value="OrganizationUnitTable">Organization Units</TabsTrigger>
          <TabsTrigger value="AddOrganizationUnit">Add Organization Unit</TabsTrigger>
        </TabsList>
        <TabsContent value="OrganizationUnitTable">
          <OrganizationUnitTable
            organizationUnits={OrganizationUnits}
            setOrganizationUnits={setOrganizationUnits}
          />
        </TabsContent>
        <TabsContent value="AddOrganizationUnit" className="flex-1">
          <AddOrganizationUnit setOrganizationUnits={setOrganizationUnits} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default OrganizationUnit;
