import React from "react";
import { api } from "@/trpc/server";
import Student from "./_components/Student";
import TopHeaderComponent from "@/app/_components/TopHeader";

const page = async () => {
  function generateYears() {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push({ value: i.toString() });
    }

    return years;
  }

  const [students, courses] = await Promise.all([
    api.schoolAdmin.getAllStudents(),
    api.schoolAdmin.getAllActiveCourses(),
  ]);

  return (
    <div>
      <TopHeaderComponent
        pathName="School Admin / Student"
        pageName="Student"
      />
      <div>
        <Student student={students} courses={courses} batches={generateYears()} />
      </div>
    </div>
  );
};

export default page;
