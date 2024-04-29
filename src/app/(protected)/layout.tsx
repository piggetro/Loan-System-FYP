import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { MantineProvider } from "@mantine/core";
import { Toaster } from "@/app/_components/ui/toaster";
import PageLayout from "../_components/PageLayout";
import { api } from "@/trpc/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  preload: true,
});

export const metadata = {
  title: "SOC Loan System",
  description: "Loan System",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const data = await api.user.getAllAccessRights();

  return (
    <html lang="en">
      <body
        className={`font-sans ${inter.variable} bg-[#EDEDED] text-slate-900`}
      >
        <TRPCReactProvider>
          <MantineProvider>
            <Toaster />
            <div className="relative min-h-screen">
              <PageLayout accessRight={data!}>{children}</PageLayout>
            </div>
          </MantineProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
export const dynamic = "force-dynamic";
