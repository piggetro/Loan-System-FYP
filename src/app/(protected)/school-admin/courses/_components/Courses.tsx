"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import type { Course } from "./CoursesColumns";
import CoursesTable from "./CoursesTable";

interface CoursesProps {
  courses: Course[];
}

const Courses = ({ courses: data }: CoursesProps) => {
  const [courses, setCourses] = useState<Course[]>(data);

  return (
    <Tabs defaultValue="courses" className="mt-4">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <TabsList className="mb-2">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="addCourse">Add Course</TabsTrigger>
        </TabsList>
        <TabsContent value="courses">
          <CoursesTable courses={courses} setCourses={setCourses} />
        </TabsContent>
        <TabsContent value="addCourse" className="flex-1">
          Add Course
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default Courses;
