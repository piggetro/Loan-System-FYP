"use client";

import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/_components/ui/tabs";
import { type Course } from "./CourseColumns";
import CourseTable from "./CourseTable";
import AddCourse from "./AddCourses";

interface CourseProps {
  course: Course[],
}

const Course =({
  course: data,
}:CourseProps) =>{
  const [course,setCourse] = useState<Course[]>(data);
  return(
    <Tabs defaultValue="course" className="mt-4">
      <div className="mt-2 rounded-md bg-white px-6 py-4">
        <TabsList className="mb-2">
          <TabsTrigger value="course">Course</TabsTrigger>
          <TabsTrigger value="addCourse">Add Course</TabsTrigger>
        </TabsList>
        <TabsContent value="course">
          <CourseTable course={course} setCourse={setCourse} />
        </TabsContent>
        <TabsContent value="addCourse" className="flex-1">
          <AddCourse 
          setCourse={setCourse} />
        </TabsContent>
      </div>
    </Tabs>
  )
}
export default Course;