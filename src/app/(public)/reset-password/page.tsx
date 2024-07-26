import React from "react";
import ResetPasswordComponent from "./_component/reset-password";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth/validate-request";

const ResetPasswordPage = async () => {
  //Checking if logged in
  const { user } = await validateRequest();

  if (user !== null) {
    redirect("/");
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#EDEDED]">
      <div className="flex flex-grow items-center ">
        <ResetPasswordComponent />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
