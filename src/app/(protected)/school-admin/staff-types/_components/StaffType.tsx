"use client";

import React, { useState } from "react";
import { StaffTypes } from "./StaffTypeColumns";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import AddStaffType from "./AddStaffType";
import StaffTypeTable from "./StaffTypeTable";

interface StaffTypeProps {
  data: StaffTypes[];
}

const StaffType = ({ data }: StaffTypeProps) => {
  const [StaffTypes, setStaffTypes] = useState<StaffTypes[]>(data);

  return (
    <Tabs defaultValue="StaffTypeTable" className="mt-4">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <TabsList className="mb-2">
          <TabsTrigger value="StaffTypeTable">Staff Types</TabsTrigger>
          <TabsTrigger value="AddStaffType">Add Staff Type</TabsTrigger>
        </TabsList>
        <TabsContent value="StaffTypeTable">
          <StaffTypeTable
            staffTypes={StaffTypes}
            setStaffTypes={setStaffTypes}
          />
        </TabsContent>
        <TabsContent value="AddStaffType" className="flex-1">
          <AddStaffType setStaffTypes={setStaffTypes} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default StaffType;
