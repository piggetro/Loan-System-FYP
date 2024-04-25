import React from "react";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import getUser from "@/lib/getUser";

interface pageProps {}
const page = async ({}: pageProps) => {
  await getUser();
  return <div>page</div>;
};

export default page;
