import React from "react";
import { api } from "@/trpc/server";

interface pageProps {
  params: { id: string };
}

const page = async ({ params }: pageProps) => {
  return (
    <div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        {params.id}
      </h3>
      <div></div>
    </div>
  );
};

export default page;
