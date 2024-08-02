import {
  FolderKanban,
  Home,
  Lock,
  NotebookText,
  Search,
  SquareDashedKanban,
} from "lucide-react";

export type NavbarNavItem = {
  title: string;
  path?: string;
  icon?: React.ReactNode;
  children?: NavbarNavItem[];
};

export const NAVBAR_NAV_ITEMS: NavbarNavItem[] = [
  {
    title: "Dashboard",
    path: "/",
    icon: <Home className="mr-1" height={16} width={16} strokeWidth={3} />,
  },
  {
    title: "Equipment Loans",
    icon: (
      <FolderKanban className="mr-1" height={16} width={16} strokeWidth={3} />
    ),
    children: [
      {
        title: "Loan Request",
        path: "/equipment-loans/loan-request",
      },
      {
        title: "Loans",
        path: "/equipment-loans/loans",
      },
      {
        title: "Overdue Loans",
        path: "/equipment-loans/overdue-loans",
      },
      {
        title: "History",
        path: "/equipment-loans/history",
      },
      {
        title: "Lost/Damaged Loans",
        path: "/equipment-loans/lost-damaged-loans",
      },
      {
        title: "Waiver",
        path: "/equipment-loans/waiver",
      },
    ],
  },
  {
    title: "Equipment Management",
    icon: (
      <SquareDashedKanban
        className="mr-1"
        height={16}
        width={16}
        strokeWidth={3}
      />
    ),
    children: [
      {
        title: "Equipment",
        path: "/equipment-management/equipment",
      },
      {
        title: "Equipment Categories",
        path: "/equipment-management/equipment-categories",
      },
      {
        title: "General Settings",
        path: "/equipment-management/general-settings",
      },
    ],
  },
  {
    title: "School Admin",
    icon: <Lock className="mr-1" height={16} width={16} strokeWidth={3} />,
    children: [
      {
        title: "Staff",
        path: "/school-admin/staff",
      },
      {
        title: "Student",
        path: "/school-admin/student",
      },
      {
        title: "Courses",
        path: "/school-admin/courses",
      },
      {
        title: "Staff Types",
        path: "/school-admin/staff-types",
      },
      {
        title: "Organisation Units",
        path: "/school-admin/organisation-units",
      },
      {
        title: "Roles",
        path: "/school-admin/roles",
      },
      {
        title: "Access Rights",
        path: "/school-admin/access-rights",
      },
      {
        title: "Semester and Holidays",
        path: "/school-admin/semester-and-holidays",
      },
    ],
  },
  {
    title: "Loan Management",
    icon: <Search className="mr-1" height={16} width={16} strokeWidth={3} />,
    children: [
      {
        title: "Preparation",
        path: "/loan-management/preparation",
      },
      {
        title: "Collection",
        path: "/loan-management/collection",
      },
      {
        title: "Return",
        path: "/loan-management/return",
      },
      {
        title: "Track Loans",
        path: "/loan-management/track-loans",
      },
      {
        title: "Lost/Damaged Loans",
        path: "/loan-management/lost-damaged-loans",
      },
      {
        title: "Waiver",
        path: "/loan-management/waiver",
      },
    ],
  },
  {
    title: "Approval Management",
    path: "/approval-management",
    icon: (
      <FolderKanban className="mr-1" height={16} width={16} strokeWidth={3} />
    ),
  },
  {
    title: "User Guide",
    path: "/user-guide",
    icon: (
      <NotebookText className="mr-1" height={16} width={16} strokeWidth={3} />
    ),
  },
];
