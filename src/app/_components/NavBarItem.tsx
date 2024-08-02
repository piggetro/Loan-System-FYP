"use client";
import { NavbarNavItem } from "@/path";
import Link from "next/link";
import React, { useState } from "react";
import { Menu } from "lucide-react"; // Import the Menu icon from Lucide
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/_components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/app/_components/ui/sheet";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/app/_components/ui/accordion";

interface NavBarItemProps {
  navBarItems: NavbarNavItem[];
}

const NavBarItem = ({ navBarItems }: NavBarItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger menu for smaller screens */}
      <div className="lg:hidden flex items-center">
        <button onClick={() => setIsOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Regular navigation bar for larger screens */}
      <div className="hidden lg:flex flex-row items-center space-x-5">
        {navBarItems.map((navBarItem) => {
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
      </div>

      {/* Sheet for smaller screens */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="bg-[#1b698d] text-white">
          <div className="p-4">
            <Accordion type="single" collapsible className="text-white">
              {navBarItems.map((navBarItem) => {
                if (!navBarItem.children) {
                  return (
                    <Link
                      href={navBarItem.path!}
                      key={navBarItem.title}
                      onClick={() => setIsOpen(false)}
                      className="block py-4 text-sm font-medium"
                    >
                      <span className="flex h-full w-full items-center">
                        {navBarItem.icon}
                        {navBarItem.title}
                      </span>
                    </Link>
                  );
                } else {
                  return (
                    <AccordionItem className="border-none" key={navBarItem.title} value={navBarItem.title}>
                      <AccordionTrigger className="text-white">
                        <span className="flex h-full w-full items-center">
                          {navBarItem.icon}
                          {navBarItem.title}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="bg-[#1b698d] text-white">
                        {navBarItem.children.map((child) => (
                          <Link
                            href={child.path!}
                            className="block w-full text-left p-2 pl-4"
                            key={child.title}
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="flex h-full w-full items-center">
                              {child.title}
                            </span>
                          </Link>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  );
                }
              })}
            </Accordion>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default NavBarItem;
