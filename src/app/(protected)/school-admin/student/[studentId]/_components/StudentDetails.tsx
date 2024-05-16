"use client";

import React, { useCallback, useMemo, useState } from "react";
import { type AccessRights, accessRightColumns } from "./AccessRightColumns";
import StudentInfo from "./StudentInfo";
import type { Batch, Course, Student } from "./StudentInfo";
import { Separator } from "@/app/_components/ui/separator";
import { AccessRightDataTable } from "./AccessRightDataTable";
import DeleteAccessRight from "./DeleteAccessRight";
import AddAccessRight from "./AddAccessRight";
import { Button } from "@/app/_components/ui/button";

interface StudentDetailsProps {
  student: Student;
  courses: Course[];
  batches: Batch[];
  accessRights: AccessRights[];
}

const StudentDetails = ({
  student: data,
  accessRights: dataAccessRights,
  courses,
  batches,
}: StudentDetailsProps) => {
  const [student, setStudent] = useState<Student>({
    id: data.id,
    mobile: data.mobile,
    email: data.email,
    name: data.name,
    course: data.course,
    batch: data.batch,
    graduationDate: data.graduationDate,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const [accessRights, setAccessRights] =
    useState<AccessRights[]>(dataAccessRights);

  const [selectedAccessRight, setSelectedAccessRight] =
    useState<AccessRights | null>(null);

  const onDelete = useCallback((accessRight: AccessRights) => {
    setSelectedAccessRight(accessRight);
    setIsDeleteDialogOpen(true);
  }, []);

  const TableColumns = useMemo(() => accessRightColumns({ onDelete }), []);

  return (
    <div className="mt-6 rounded-md bg-white px-6 py-4">
      <StudentInfo
        student={student}
        courses={courses}
        batches={batches}
        setStudent={setStudent}
      />
      <Separator className="my-3" />
      <AddAccessRight
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        setAccessRights={setAccessRights}
        studentId={student.id}
      />
      <DeleteAccessRight
        accessRight={selectedAccessRight}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        setAccessRghts={setAccessRights}
        studentId={student.id}
      />
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Access Rights</h3>
        <Button onClick={() => setIsDialogOpen(true)}>
          Grant More Access Rights
        </Button>
      </div>
      <AccessRightDataTable data={accessRights} columns={TableColumns} />
    </div>
  );
};

export default StudentDetails;
