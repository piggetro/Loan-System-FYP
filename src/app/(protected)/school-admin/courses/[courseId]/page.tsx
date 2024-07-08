import TopHeaderComponent from "@/app/_components/TopHeader";
import { api } from "@/trpc/server";
import React from "react";
import CourseDetails from "./_components/CourseDetails";

interface pageProps {
  params: { courseId: string };
}

const page = async ({ params }: pageProps) => {
  const data = await api.courses.getCourse({ id: params.courseId });

  return (
    <div>
      <TopHeaderComponent
        pathName="School Admin / Courses"
        pageName="Courses"
        goBackLink="/school-admin/courses"
      />
      <CourseDetails course={data.course} equipments={data.equipments} />
    </div>
  );
};

export default page;
