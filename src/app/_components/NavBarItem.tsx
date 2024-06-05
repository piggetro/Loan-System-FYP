import type { NavbarNavItem } from "@/path";
import Link from "next/link";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";

interface NavBarItemProps {
  navBarItems: NavbarNavItem[];
}

const NavBarItem = ({ navBarItems }: NavBarItemProps) => {
  return (
    <>
      {navBarItems.map((navBarItem) => {
        // If the item does not have children, return the Link component
        if (!navBarItem.children) {
          return (
            <Link href={navBarItem.path!} key={navBarItem.title}>
              <span className="flex h-full w-full items-center justify-start">
                {navBarItem.icon}
                {navBarItem.title}
              </span>
            </Link>
          );
        } else {
          return (
            <DropdownMenu key={navBarItem.title}>
              <DropdownMenuTrigger>
                <span className="flex h-full w-full items-center justify-start">
                  {navBarItem.icon}
                  {navBarItem.title}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {navBarItem.children.map((child) => (
                  <Link
                    href={child.path!}
                    className="block w-full text-left"
                    key={child.title}
                  >
                    <DropdownMenuItem>
                      <span className="flex h-full w-full items-center">
                        {child.title}
                      </span>
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      })}
    </>
  );
};

export default NavBarItem;
