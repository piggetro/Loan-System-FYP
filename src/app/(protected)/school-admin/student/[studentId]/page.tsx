import React from "react";
import { api } from "@/trpc/server";
import StudentDetails from "./_components/StudentDetails";
import TopHeaderComponent from "@/app/_components/TopHeader";

interface pageProps {
  params: { studentId: string };
}

const page = async ({ params }: pageProps) => {
  function generateYears() {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push({ value: i.toString() });
    }

    return years;
  }
  const [student, courses, accessRights] = await Promise.all([
    api.schoolAdmin.getStudent({ id: params.studentId }),
    api.schoolAdmin.getAllActiveCourses(),
    api.schoolAdmin.getStudentAccessRights({ id: params.studentId }),
  ]);
  return (
    <div>
      <TopHeaderComponent
        pathName="School Admin / Student"
        pageName="Student"
      />
      <div>
        <StudentDetails
          student={student}
          courses={courses}
          accessRights={accessRights}
          batches={generateYears()}
        />
      </div>
    </div>
  );
};

export default page;
