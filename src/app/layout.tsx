import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/app/_components/ui/toaster";
import { MantineProvider } from "@mantine/core";
import ProgressBarProvider from "./_components/ProgressBar";

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
  return (
    <html lang="en">
      <body
        className={`font-sans ${inter.variable}   bg-slate-50  text-slate-900`}
      >
        <ProgressBarProvider>
          <TRPCReactProvider>
            <MantineProvider>
              {children}
              <Toaster />
            </MantineProvider>
          </TRPCReactProvider>
        </ProgressBarProvider>
      </body>
    </html>
  );
}
export const dynamic = "force-dynamic";
