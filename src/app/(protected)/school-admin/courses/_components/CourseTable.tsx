import React, { useCallback, useMemo, useState } from "react";
import {CourseDataTable} from "./CourseDataTable";
import { type Course, CourseColumns } from "./CourseColumns" 
import { useRouter } from "next/navigation";
import DeleteCourse from "./DeleteCourse";
import DeleteStaff from "../../staff/_components/DeleteStaff";
import { selectRowsFn } from "@tanstack/react-table";
import { set } from "react-hook-form";
import StaffTable from "../../staff/_components/StaffTable";

interface CourseTableProps {
    course: Course[];
    setCourse: React.Dispatch<React.SetStateAction<Course[]>>;
}

const CourseTable = ({ course, setCourse}: CourseTableProps)=>{
    const router = useRouter();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [selectedCourse, setSelectedCoruse] = useState<Course | null>(null);

    const onView = useCallback((course: Course) => {
        router.push(`/school-admin/course/${course.id}`);
    }, []);
    const onDelete = useCallback((course: Course)=> {
        setSelectedCoruse(course);
        setIsDeleteDialogOpen(true);
    },[]);

    const TableColumns = useMemo(() => CourseColumns({onView, onDelete}),[]);

    return (
        <>
        <DeleteCourse
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        course={selectedCourse}
        setCourse={setCourse}/>
        </>
    );
};

export default CourseTable;
