import React from "react";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";
import RegisterComponent from "./_component/register";

const LoginPage = async () => {
  //Checking if logged in
  const { user } = await validateRequest();
  if (user != null) {
    redirect("/");
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#EDEDED]">
      <div className="flex flex-grow items-center ">
        <RegisterComponent />
      </div>
    </div>
  );
};

export default LoginPage;
