import React, { use, useCallback, useMemo } from "react";
import { AccessRights, columns } from "./_components/Columns";
import { DataTable } from "./_components/DataTable";

async function getData(): Promise<AccessRights[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      pageName: "School Admin",
      pageLink: "/school-admin/access-rights",
    },
  ];
}
const page = async () => {
  const data = await getData();

  const onEdit = useCallback((accessRight: AccessRights) => {
    alert(accessRight.id);
  }, []);

  const onDelete = useCallback((accessRight: AccessRights) => {
    alert(accessRight.id);
  }, []);

  const TableColumns = useMemo(() => columns({ onEdit, onDelete }), []);

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        School Admin / Access Rights
      </p>
      <h2 className="mt-5 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Access Rights
      </h2>
      <div className="mt-5 h-fit rounded-md bg-white p-4">
        <DataTable columns={TableColumns} defaultData={data} />
      </div>
    </div>
  );
};

export default page;
