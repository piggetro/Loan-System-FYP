import React from "react";
import { api } from "@/trpc/server";
import Course from "./_components/Course";

const page =async () => {
  const [ course ] = await Promise.all([
api.schoolAdmin.getAllCourse(),
  ]);
  return (
    <div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Course
      </h3>
      <div>
        <Course
        course={course} />
      </div>
    </div>
  )
}

export default page;