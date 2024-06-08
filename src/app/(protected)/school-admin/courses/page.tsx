import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import Courses from "./_components/Courses";

const page = async () => {
  const data = await api.courses.getAllCourses();

  return (
    <div>
      <TopHeaderComponent
        pathName="School Admin / Courses"
        pageName="Courses"
      />
      <Courses courses={data} />
    </div>
  );
};

export default page;
