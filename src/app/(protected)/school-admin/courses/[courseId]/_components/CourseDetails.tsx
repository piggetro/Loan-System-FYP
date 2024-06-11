"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Separator } from "@/app/_components/ui/separator";
import { Button } from "@/app/_components/ui/button";
import CourseInfo, { Course } from "./CouseInfo";
import {
  Equipment,
  equipmentColumns,
} from "@/app/_components/EquipmentColumns";
import AddEquipment from "./AddEquipment";
import RemoveEquipment from "./RemoveEquipment";
import { EquipmentDataTable } from "@/app/_components/EquipmentDataTable";

interface CourseDetailsProps {
  course: Course;
  equipments: Equipment[];
}

const CourseDetails = ({ course: data, equipments: dataEquipments }: CourseDetailsProps) => {
  const [course, setCourse] = useState<Course>(data);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [equipments, setEquipments] = useState<Equipment[]>(dataEquipments);

  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );

  const onDelete = useCallback((equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setIsDeleteDialogOpen(true);
  }, []);

  const TableColumns = useMemo(() => equipmentColumns({ onDelete }), []);

  return (
    <div className="mt-6 rounded-md bg-white px-6 py-4">
      <CourseInfo course={course} setCouse={setCourse} />
      <Separator className="my-3" />
      <AddEquipment
        courseId={course.id}
        isDialogOpen={isDialogOpen}
        setEquipments={setEquipments}
        setIsDialogOpen={setIsDialogOpen}
      />
      <RemoveEquipment
        courseId={course.id}
        equipment={selectedEquipment}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        setEquipments={setEquipments}
      />
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Equipments Assigned to Course</h3>
        <Button onClick={() => setIsDialogOpen(true)}>
          Assign Equipments to Course
        </Button>
      </div>
      <EquipmentDataTable
        data={equipments}
        columns={TableColumns}
      />
    </div>
  );
};

export default CourseDetails;
