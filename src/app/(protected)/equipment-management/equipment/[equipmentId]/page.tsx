import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";

interface pageProps {
  params: { equipmentId: string };
}

const page = async ({ params }: pageProps) => {
  const [data, categories, courses] = await Promise.all([
    api.equipment.getEquipment({ id: params.equipmentId }),
    api.equipment.getCategories(),
    api.courses.getAllCourses(),
  ]);

  return (
    <div>
      <TopHeaderComponent
        pathName="School Admin / Student"
        pageName="Student"
      />
      <div></div>
    </div>
  );
};

export default page;
