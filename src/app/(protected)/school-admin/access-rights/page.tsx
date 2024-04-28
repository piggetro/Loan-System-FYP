import React from "react";
import { AccessRights } from "./_components/Columns";
import AccessRight from "./_components/AccessRight";

async function getData(): Promise<AccessRights[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      pageName: "School Admin",
      pageLink: "/school-admin/access-rights",
    },
    {
      id: "b5d1a2c1",
      pageName: "Dashboard",
      pageLink: "/",
    },
    {
      id: "f3a6e9c4",
      pageName: "Students",
      pageLink: "/students",
    },
    {
      id: "d1e7a2b3",
      pageName: "Teachers",
      pageLink: "/teachers",
    },
    {
      id: "f4b2e8a1",
      pageName: "Parents",
      pageLink: "/parents",
    },
  ];
}
const page = async () => {
  const data = await getData();

  return (
    <div>
      <h2 className="mt-5 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Access Rights
      </h2>
      <div className="mt-5 h-fit rounded-md bg-white p-4">
        <AccessRight data={data} />
      </div>
    </div>
  );
};

export default page;
