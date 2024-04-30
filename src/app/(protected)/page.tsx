import React from "react";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface pageProps {}
const page = async ({}: pageProps) => {
  return <div>page</div>;
};

export default page;
