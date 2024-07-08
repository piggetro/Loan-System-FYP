import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import EquipmentDetails from "./_components/EquipmentDetails";

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
        pathName="Equipment Management / Equipment"
        pageName="Equipment"
        goBackLink="/equipment-management/equipment"
      />
      <EquipmentDetails
        equipment={data.equipment}
        inventoryItems={data.inventoryItems ?? []}
        categories={categories}
        courses={courses}
      />
    </div>
  );
};

export default page;
