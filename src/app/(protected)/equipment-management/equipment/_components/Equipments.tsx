"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import { Equipment } from "./EquipmentColumns";
import EquipmentTable from "./EquipmentTable";
import AddEquipment, { Category } from "./AddEquipment";
import { Course } from "@/app/(protected)/school-admin/courses/_components/CoursesColumns";

interface EquipmentsProps {
  equipments: Equipment[];
  categories: Category[];
  courses: Course[];
}

const Equipments = ({ equipments: data, categories, courses }: EquipmentsProps) => {
  const [equipments, setEquipments] = useState<Equipment[]>(data);

  return (
    <Tabs defaultValue="equipments" className="mt-4">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <TabsList className="mb-2">
          <TabsTrigger value="equipments">Equipments</TabsTrigger>
          <TabsTrigger value="addEquipment">Add Equipment</TabsTrigger>
        </TabsList>
        <TabsContent value="equipments">
          <EquipmentTable
            equipments={equipments}
            setEquipments={setEquipments}
          />
        </TabsContent>
        <TabsContent value="addEquipment" className="flex-1">
          <AddEquipment setEquipment={setEquipments} categories={categories} courses={courses} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default Equipments;
