import React from "react";
import { api } from "@/trpc/server";
import StudentDetails from "./_components/StudentDetails";

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
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Student Details
      </h3>
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
