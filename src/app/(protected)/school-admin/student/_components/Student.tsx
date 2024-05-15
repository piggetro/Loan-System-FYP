"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import { type Student } from "./StudentColumns";
import StudentTable from "./StudentTable";
import AddStudent from "./AddStudent";
import type { Batch, Course } from "./AddStudent";

interface StudentProps {
  student: Student[];
  courses: Course[];
  batches: Batch[];
}

const Student = ({ student: data, courses, batches }: StudentProps) => {
  const [student, setStudent] = useState<Student[]>(data);

  return (
    <Tabs defaultValue="staff" className="mt-4">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <TabsList className="mb-2">
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="addStaff">Add Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="staff">
          <StudentTable student={student} setStudent={setStudent} />
        </TabsContent>
        <TabsContent value="addStaff" className="flex-1">
          <AddStudent
            setStudent={setStudent}
            courses={courses}
            batches={batches}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default Student;
