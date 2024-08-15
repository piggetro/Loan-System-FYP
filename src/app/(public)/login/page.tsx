import React from "react";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import LoginComponent from "./_component/Login";

const LoginPage = async () => {
  //Checking if logged in
  const { user } = await validateRequest();

  if (user != null) {
    redirect("/");
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#EDEDED]">
      <div className="flex flex-grow items-center ">
        <LoginComponent />
      </div>
    </div>
  );
};

export default LoginPage;
