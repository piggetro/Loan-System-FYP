import { verifyToken } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import ResetPasswordComponent from "./_component/reset-password-component";

interface pageProps {
  params: { id: string };
}

const page = async ({ params }: pageProps) => {
  const data = await verifyToken(params.id);
  console.log(data);
  if (!data.success || !data.user_id) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-full flex-col bg-[#EDEDED]">
      <div className="flex flex-grow items-center ">
        <ResetPasswordComponent user_id={data.user_id} />
      </div>
    </div>
  );
};

export default page;
