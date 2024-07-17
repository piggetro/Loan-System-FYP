import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import Equipments from "./_components/Equipments";

const page = async () => {
  const [data, categories, courses] = await Promise.all([
    api.equipment.getAllEquipments(),
    api.equipment.getCategories(),
    api.courses.getAllCourses(),
  ]);

  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Management / Equipment"
        pageName="Equipment"
      />
      <Equipments equipments={data} categories={categories} courses={courses}/>
    </div>
  );
};

export default page;
