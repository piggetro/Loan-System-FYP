import TopHeaderComponent from "@/app/_components/TopHeader";
import React from "react";
import GeneralSettingsForm from "./_components/GeneralSettingsForm";
import { api } from "@/trpc/server";

const page = async () => {
  const data = await api.equipment.getGeneralSettings();

  return (
    <div>
      <TopHeaderComponent
        pathName="Equipment Management"
        pageName="General Settings"
      />
      <GeneralSettingsForm generalSettings={data} />
    </div>
  );
};

export default page;
