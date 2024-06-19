export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-50 w-full text-white">
        <div className="bg-[#1c6c91]">
          <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
            <div className="flex items-center">
              <h1 className="mr-10 flex items-center space-x-2 font-semibold">
                <span className="text-xl">
                  <span className="mr-2 font-extrabold">SOC</span>
                  Loan System
                </span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="h-full w-full ">{children}</div>
    </>
  );
}
export const dynamic = "force-dynamic";
