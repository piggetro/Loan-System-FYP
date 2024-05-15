"use client";

import React from "react";
import { CircleUserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { logout } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";

interface NavProfileProps {
  name: string;
}

const NavProfile = ({ name }: NavProfileProps) => {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span className="flex h-full w-full items-center justify-start">
          <CircleUserRound
            className="mr-2"
            height={24}
            width={24}
            strokeWidth={2}
          />
          {name}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => {
            router.push("/profile");
          }}
        >
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            logout()
              .then((result) => {
                if (result.error != undefined) {
                  console.log({ title: result.error });
                }
              })
              .catch((error) => {
                console.log(error);
              });
          }}
          className="text-red-500 focus:bg-red-100 focus:text-red-500"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavProfile;
