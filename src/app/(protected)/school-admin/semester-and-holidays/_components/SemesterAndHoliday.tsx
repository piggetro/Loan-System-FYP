"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import { Semester } from "./SemesterColumns";
import SemesterTable from "./SemesterTable";
import AddSemester from "./AddSemester";
import { Holiday } from "./HolidayColumns";
import HolidayTable from "./HolidayTable";
import AddHoliday from "./AddHoliday";

interface SemesterAndHolidayProps {
  semesters: Semester[];
  holidays: Holiday[];
}

const SemesterAndHoliday = ({
  semesters,
  holidays,
}: SemesterAndHolidayProps) => {
  const [semester, setSemesters] = useState<Semester[]>(semesters);
  const [holiday, setHolidays] = useState<Holiday[]>(holidays);

  return (
    <Tabs defaultValue="semesters" className="mt-4">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <TabsList className="mb-2">
          <TabsTrigger value="semesters">Semesters</TabsTrigger>
          <TabsTrigger value="addSemester">Add Semester</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
          <TabsTrigger value="addHoliday">Add Holiday</TabsTrigger>
        </TabsList>
        <TabsContent value="semesters">
          <SemesterTable semester={semester} setSemesters={setSemesters} />
        </TabsContent>
        <TabsContent value="addSemester" className="flex-1">
          <AddSemester setSemesters={setSemesters} />
        </TabsContent>
        <TabsContent value="holidays" className="flex-1">
          <HolidayTable holiday={holiday} setHolidays={setHolidays} />
        </TabsContent>
        <TabsContent value="addHoliday" className="flex-1">
          <AddHoliday setHolidays={setHolidays} />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default SemesterAndHoliday;
