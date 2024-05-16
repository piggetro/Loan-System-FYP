/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable react/no-children-prop */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
} from "@/app/_components/ui/sheet";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  FolderKanban,
  Home,
  type LucideIcon,
  Menu,
  NotebookText,
  SquareDashedKanban,
  Lock,
  Search,
} from "lucide-react";
import { logout } from "@/lib/auth/actions";
import { toast } from "./ui/use-toast";

const PageLayout = ({
  children,
  accessRight,
}: {
  children: React.ReactNode;
  accessRight: string[];
}) => {
  const pathName = usePathname().split("/")[1] || "/";

  const topBarContent = (pathName: string) => {
    switch (pathName) {
      case "/":
        return "Dashboard";
      case "equipment-loans":
        return "Equipment Loans";
      case "equipment-management":
        return "Equipment Management";
      case "school-admin":
        return "School Admin";
      case "loan-management":
        return "Loan Management";
      case "approval-management":
        return "Approval Management";
      case "user-guide":
        return "User Guide";
      case "profile":
        return "Profile";
      default:
        "";
    }
  };

  return (
    <div className="absolute inset-0 grid md:grid-cols-[1fr_4fr]">
      <div className="sideBarContent hidden h-full overflow-y-auto bg-[#1c6c91]  p-6 md:block">
        <SideBarContent accessRight={accessRight} />
      </div>
      <div className="flex w-full flex-col">
        <div className="flex h-16 w-full items-center justify-between bg-white px-8">
          <div className="flex items-center space-x-4 md:space-x-0">
            <span className="md:hidden">
              <Sheet>
                <SheetTrigger>
                  <Menu height={18} width={18} />
                </SheetTrigger>
                <SheetContent className="bg-[#1c6c91]">
                  <SheetHeader>
                    <SheetDescription className="mt-6">
                      <SideBarContent accessRight={accessRight} />
                    </SheetDescription>
                  </SheetHeader>
                </SheetContent>
              </Sheet>
            </span>
            <span>
              <p className="leading-7 [&:not(:first-child)]:mt-6">
                {topBarContent(pathName)}
              </p>
            </span>
          </div>
          <span>
            {/* Profile */}
            {/* ONLY FOR DEV FOR EASE OF SIGN OUT */}
            <div
              onClick={() => {
                logout()
                  .then((result) => {
                    if (result.error != undefined) {
                      toast({ title: result.error });
                    }
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              }}
            >
              Logout
            </div>
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-4">{children}</div>
      </div>
    </div>
  );
};

const SideBarContent = ({ accessRight }: { accessRight: string[] }) => {
  const [isActiveItem, setIsActiveItem] = useState<string>(
    usePathname().split("/")[1] || "/",
  );

  const chceckAccessRight = (pathname: string) => {
    return accessRight.includes(pathname);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="mb-4 flex w-full px-5 text-2xl text-white">
        <span className="mr-2 font-bold">SOC</span>Loan System
      </div>
      {chceckAccessRight("/") && (
        <SideBarItem
          pathName="/"
          Icon={Home}
          name="Dashboard"
          setIsActiveItem={setIsActiveItem}
        />
      )}

      <SideBarAccordion
        name="Equipment Loans"
        Icon={FolderKanban}
        children={equipmentLoans.filter(
          (item) => chceckAccessRight(item.pathName) && item,
        )}
        setIsActiveItem={setIsActiveItem}
        isActiveItem={isActiveItem}
      />

      <SideBarAccordion
        name="Equipment Management"
        Icon={SquareDashedKanban}
        children={equipmentManagement.filter(
          (item) => chceckAccessRight(item.pathName) && item,
        )}
        setIsActiveItem={setIsActiveItem}
        isActiveItem={isActiveItem}
      />

      <SideBarAccordion
        name="School Admin"
        Icon={Lock}
        children={schoolAdmin.filter(
          (item) => chceckAccessRight(item.pathName) && item,
        )}
        setIsActiveItem={setIsActiveItem}
        isActiveItem={isActiveItem}
      />

      <SideBarAccordion
        name="Loan Management"
        Icon={Search}
        children={loanManagement.filter(
          (item) => chceckAccessRight(item.pathName) && item,
        )}
        setIsActiveItem={setIsActiveItem}
        isActiveItem={isActiveItem}
      />

      {chceckAccessRight("/approval-management") && (
        <SideBarItem
          pathName="/approval-management"
          Icon={FolderKanban}
          name="Approval Management"
          setIsActiveItem={setIsActiveItem}
        />
      )}

      {chceckAccessRight("/user-guide") && (
        <SideBarItem
          pathName="/user-guide"
          Icon={NotebookText}
          name="User Guide"
          setIsActiveItem={setIsActiveItem}
        />
      )}
    </div>
  );
};

const SideBarItem = ({
  pathName,
  Icon,
  name,
  setIsActiveItem,
}: {
  pathName: string;
  Icon?: LucideIcon;
  name: string;
  setIsActiveItem: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const currentPathName = usePathname();

  const isActive = (pathname: string) => currentPathName === pathname;

  return (
    <Link href={pathName}>
      <Button
        variant={isActive(pathName) ? "outline" : "ghost"}
        className="flex h-12 w-full items-center justify-start p-0"
        onClick={() => {
          setIsActiveItem(pathName.split("/")[1] || "/");
        }}
      >
        <span
          className={`flex h-full w-full items-center justify-start px-5 ${isActive(pathName) ? "text-black" : "text-white hover:text-black"}`}
        >
          {Icon && <Icon className="mr-2" height={24} width={24} />}
          {name}
        </span>
      </Button>
    </Link>
  );
};

type SideBarAccordionItemProps = {
  itemName: string;
  pathName: string;
};

const SideBarAccordion = ({
  name,
  Icon,
  children,
  setIsActiveItem,
  isActiveItem,
}: {
  name: string;
  Icon?: LucideIcon;
  children: SideBarAccordionItemProps[];
  setIsActiveItem: React.Dispatch<React.SetStateAction<string>>;
  isActiveItem: string;
}) => {
  if (!children.length) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleAccordion = () => {
    if (!isOpen) {
      contentRef.current && setMaxHeight(contentRef.current.scrollHeight);
    } else {
      setMaxHeight(0);
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const shouldExpand =
      (children[0] && isActiveItem === children[0].pathName.split("/")[1]) ||
      false;
    setIsOpen(shouldExpand);
    if (shouldExpand) {
      contentRef.current && setMaxHeight(contentRef.current.scrollHeight);
    } else if (!shouldExpand && isActiveItem !== name) {
      setMaxHeight(0);
    }
  }, [isActiveItem, children, name]);

  return (
    <div className="flex flex-col">
      <Button
        variant={isOpen ? "outline" : "ghost"}
        className="flex h-12 w-full items-center justify-start p-0"
        onClick={toggleAccordion}
      >
        <span
          className={`flex h-full w-full items-center justify-start px-5 ${isOpen ? "text-black" : "text-white hover:text-black"}`}
        >
          {Icon && <Icon className="mr-2" height={24} width={24} />}
          {name}
        </span>
      </Button>
      <div
        ref={contentRef}
        style={{ maxHeight: `${maxHeight}px` }}
        className="ms-4 overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div className="mt-2 flex flex-col space-y-2">
          {children.map((child) => (
            <SideBarAccordionItem
              key={child.pathName}
              pathName={child.pathName}
              name={child.itemName}
              setIsActiveItem={setIsActiveItem}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const SideBarAccordionItem = ({
  pathName,
  name,
  setIsActiveItem,
}: {
  pathName: string;
  name: string;
  setIsActiveItem: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const currentPathName = usePathname();

  const isActive = (pathname: string) => currentPathName === pathname;

  return (
    <Link href={pathName}>
      <Button
        className={`flex h-12 w-full items-center justify-start hover:bg-[#7698A8] ${isActive(pathName) ? "bg-[#7698A8]" : " bg-transparent"}`}
        onClick={() => {
          setIsActiveItem(pathName.split("/")[1] || "/");
        }}
      >
        <span className={`flex h-full w-full items-center justify-start px-5`}>
          {name}
        </span>
      </Button>
    </Link>
  );
};

export default PageLayout;

const equipmentLoans = [
  {
    itemName: "Loan Request",
    pathName: "/equipment-loans/loan-request",
  },
  {
    itemName: "Loans",
    pathName: "/equipment-loans/loans",
  },
  {
    itemName: "Overdue Loans",
    pathName: "/equipment-loans/overdue-loans",
  },
  {
    itemName: "History",
    pathName: "/equipment-loans/history",
  },
  {
    itemName: "Lost/Broken Loans",
    pathName: "/equipment-loans/lost-broken-loans",
  },
];

const equipmentManagement = [
  {
    itemName: "Equipment",
    pathName: "/equipment-management/equipment",
  },
  {
    itemName: "Inventory",
    pathName: "/equipment-management/inventory",
  },
  {
    itemName: "Equipment Categories",
    pathName: "/equipment-management/equipment-categories",
  },
  {
    itemName: "Eqiuipment Status",
    pathName: "/equipment-management/eqiupment-status",
  },
  {
    itemName: "General Settings",
    pathName: "/equipment-management/general-settings",
  },
];

const schoolAdmin = [
  {
    itemName: "Staff",
    pathName: "/school-admin/staff",
  },
  {
    itemName: "Student",
    pathName: "/school-admin/student",
  },
  {
    itemName: "Years of Admission",
    pathName: "/school-admin/years-of-admission",
  },
  {
    itemName: "Courses",
    pathName: "/school-admin/courses",
  },
  {
    itemName: "Staff Types",
    pathName: "/school-admin/staff-types",
  },
  {
    itemName: "Organization Units",
    pathName: "/school-admin/organisation-units",
  },
  {
    itemName: "Roles",
    pathName: "/school-admin/roles",
  },
  {
    itemName: "Access Rights",
    pathName: "/school-admin/access-rights",
  },
  {
    itemName: "School Details",
    pathName: "/school-admin/school-details",
  },
  {
    itemName: "Semester and Holidays",
    pathName: "/school-admin/semester-and-holidays",
  },
];

const loanManagement = [
  {
    itemName: "Preparation",
    pathName: "/loan-management/preparation",
  },
  {
    itemName: "Collection",
    pathName: "/loan-management/collection",
  },
  {
    itemName: "Return",
    pathName: "/loan-management/return",
  },
  {
    itemName: "Track Loans",
    pathName: "/loan-management/track-loans",
  },
  {
    itemName: "Lost/Broken Loans",
    pathName: "/loan-management/lost-broken-loans",
  },
  {
    itemName: "Waiver",
    pathName: "/loan-management/waiver",
  },
];
