import React, { useCallback, useMemo, useState } from "react";
import {CourseDataTable} from "./CourseDataTable";
import { type Course, CourseColumns } from "./CourseColumns" 
import { useRouter } from "next/navigation";
import DeleteCourse from "./DeleteCourse";

interface CourseTableProps {
    course: Course[];
    setCourse: React.Dispatch<React.SetStateAction<Course[]>>;
}

const CourseTable = ({ course, setCourse}: CoursetableProps)=>{
    const router = useRouter();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
    const [seletedCourse, setSelectedCoruse] = useState<Course | null>(null);

    
}

