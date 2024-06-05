import React from "react";
import { api } from "@/trpc/server";
import Course from "./_components/Course";
import TopHeaderComponent from "@/app/_components/TopHeader";

const page =async () => {
  const [ course ] = await Promise.all([
api.schoolAdmin.getAllCourse(),
  ]);
  return (
    <div>
      <TopHeaderComponent
        pathName="School Admin / Courses"
        pageName="Courses"
      />
      <div>
        <Course
        course={course} />
      </div>
    </div>
  )
}

export default page;