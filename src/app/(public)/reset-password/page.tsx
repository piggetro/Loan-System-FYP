import React from "react";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import ResetComponent from "./_component/reset";

const LoginPage = async () => {
  //Checking if logged in
  const { user } = await validateRequest();
  if (user != null) {
    redirect("/");
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#EDEDED]">
      <div className="flex h-16 items-center bg-white pl-10 text-2xl">
        <span className="mr-2 font-bold">SOC</span>Loan System
      </div>
      <div className="flex flex-grow items-center ">
        <ResetComponent />
      </div>
    </div>
  );
};

export default LoginPage;
