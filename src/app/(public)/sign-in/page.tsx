import React from "react";
import LoginComponent from "./_component/login";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

const LoginPage = async () => {
  //Checking if logged in
  const user = await getServerAuthSession();

  if (user != null) {
    redirect("/");
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#EDEDED]">
      <div className="flex h-16 items-center bg-white pl-10 text-2xl">
        <span className="mr-2 font-bold">SOC</span>Loan System
      </div>
      <div className="flex flex-grow items-center ">
        <LoginComponent />
      </div>
    </div>
  );
};

export default LoginPage;
