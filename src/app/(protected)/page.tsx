import React from "react";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";

interface pageProps {}
const page = async ({}: pageProps) => {
  return <div>page</div>;
};

export default page;
