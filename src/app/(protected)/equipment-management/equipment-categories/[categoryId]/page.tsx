import TopHeaderComponent from "@/app/_components/TopHeader";
import { api } from "@/trpc/server";
import React from "react";
import SubCategoryDetails from "./SubCategoryDetails";

interface pageProps {
  params: { categoryId: string };
}

const page = async ({ params: { categoryId } }: pageProps) => {
  const data = await api.equipment.getCategory({ id: categoryId });
  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Management / Equipment Categories"
        pageName="Equipment Categories"
        goBackLink="/equipment-management/equipment-categories"
      />
      <SubCategoryDetails
        category={{ id: data.id, name: data.name }}
        subCategory={data.subCategory}
      />
    </div>
  );
};

export default page;
