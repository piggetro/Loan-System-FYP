import TopHeaderComponent from "@/app/_components/TopHeader";
import React from 'react';
import { api } from "@/trpc/server";
import Profile from "./_components/Profile";

const page = async () => {
  const user = await api.profile.getParticulars();

  return (
    <div>
      <TopHeaderComponent
        pathName="My Profile"
        pageName="My Profile"
      />
      <Profile user={user} />
    </div>
  );
};

export default page;
