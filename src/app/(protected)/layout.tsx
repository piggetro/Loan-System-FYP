import dynamic from "next/dynamic";
import { api } from "@/trpc/server";
import Link from "next/link";
import { NAVBAR_NAV_ITEMS, type NavbarNavItem } from "@/path";
import { validateRequest } from "@/lib/auth/validate-request";
import NavProfile from "../_components/NavProfile";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const NavBarItem = dynamic(() => import("@/app/_components/NavBarItem"), {
    loading: () => (
      <div className="skeleton-nav-item mr-2 flex h-4 items-center">
        <div className="skeleton-text mr-1 h-full w-4 animate-pulse rounded-full bg-gray-200"></div>
        <div className="skeleton-icon mr-2 h-full w-12 animate-pulse rounded-sm bg-gray-200"></div>
        <div className="skeleton-text mr-1 h-full w-4 animate-pulse rounded-full bg-gray-200"></div>
        <div className="skeleton-icon mr-2 h-full w-12 animate-pulse rounded-sm bg-gray-200"></div>
        <div className="skeleton-text mr-1 h-full w-4 animate-pulse rounded-full bg-gray-200"></div>
        <div className="skeleton-icon mr-2 h-full w-12 animate-pulse rounded-sm bg-gray-200"></div>
        <div className="skeleton-text mr-1 h-full w-4 animate-pulse rounded-full bg-gray-200"></div>
        <div className="skeleton-icon mr-2 h-full w-12 animate-pulse rounded-sm bg-gray-200"></div>
        <div className="skeleton-text mr-1 h-full w-4 animate-pulse rounded-full bg-gray-200"></div>
        <div className="skeleton-icon mr-2 h-full w-12 animate-pulse rounded-sm bg-gray-200"></div>
      </div>
    ),
    ssr: false,
  });
  const data = await api.user.getAllAccessRights();

  function filterNavItems(navItems: NavbarNavItem[], filterPaths: string[]) {
    return navItems.reduce<NavbarNavItem[]>((acc, item) => {
      if (item.path && filterPaths.includes(item.path)) {
        acc.push(item);
      } else if (item.children) {
        const filteredChildren = filterNavItems(item.children, filterPaths);
        if (filteredChildren.length > 0) {
          acc.push({ ...item, children: filteredChildren });
        }
      }
      return acc;
    }, []);
  }

  const filteredNavItems = filterNavItems(NAVBAR_NAV_ITEMS, data);

  const { user } = await validateRequest();

  return (
    <>
      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full text-white">
          <div className="bg-[#1c6c91]">
            <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
              <div className="flex items-center">
                <Link
                  className="mr-10 flex items-center space-x-2 font-semibold"
                  href="/"
                >
                  <span className="text-xl">
                    <span className="mr-2 font-extrabold">SOC</span>
                    Loan System
                  </span>
                </Link>
              </div>
              <div className="flex items-center">
                <span className="text-l flex h-full w-full items-center justify-start font-semibold">
                  <NavProfile name={user?.name ?? "Default Name"} />
                </span>
              </div>
            </div>
          </div>
          <div className="bg-[#1b698d]">
            <div className="container flex h-12 max-w-screen-2xl items-center justify-between">
              <nav className="items-center gap-4 text-sm md:flex lg:gap-8">
                <NavBarItem navBarItems={filteredNavItems} />
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="container-relative mx-auto px-4 py-1 md:px-8 lg:max-w-screen-2xl">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
