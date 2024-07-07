import React from "react";
import { api } from "@/trpc/server";
import TopHeaderComponent from "@/app/_components/TopHeader";
import SemesterAndHoliday from "./_components/SemesterAndHoliday";

const page = async () => {
  const [semesters, holidays] = await Promise.all([
    api.semesterHoliday.getSemester(),
    api.semesterHoliday.getHoliday(),
  ]);

  return (
    <div>
      <TopHeaderComponent
        pathName="School Admin / Semester and Holidays"
        pageName="Semester and Holidays"
      />
      <div>
        <SemesterAndHoliday semesters={semesters} holidays={holidays}/>
      </div>
    </div>
  );
};

export default page;
