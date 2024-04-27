import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/app/_components/ui/toaster";
import { MantineProvider } from "@mantine/core";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  preload: true,
});

export const metadata = {
  title: "Register",
  description: "Register Page For SOC Loan System",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${inter.variable}   bg-slate-50  text-slate-900`}
      >
        <TRPCReactProvider>
          <MantineProvider>
            <div className="h-full w-full ">{children}</div>
            <Toaster />
          </MantineProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
export const dynamic = "force-dynamic";
