import React from "react";
import { Payment, columns } from "./_components/Columns";
import { DataTable } from "./_components/DataTable";

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    // ...
  ];
}
const page = async () => {
  const data = await getData();

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        School Admin / Access Rights
      </p>
      <h2 className="mt-5 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Access Rights
      </h2>
      <div className="mt-5 bg-white rounded-md p-4 h-fit">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default page;
