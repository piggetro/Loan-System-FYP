import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import { api } from "@/trpc/server";
import Categories from "./_components/Categories";

const page = async () => {
  const data = await api.equipment.getCategories();

  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Management / Categories"
        pageName="Categories"
      />
      <Categories categories={data} />
    </div>
  );
};

export default page;
