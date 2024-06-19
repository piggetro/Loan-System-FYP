import Link from "next/link";

export default function NotFound() {
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

      <div className="h-full w-full ">
        <div className="flex h-screen w-full flex-col bg-[#EDEDED]">
          <div className="flex flex-grow items-center ">
            <div className="mx-auto w-1/3 min-w-96">
              <div className="mb-4 rounded-xl bg-white px-8 pb-8 pt-6 shadow-lg">
                  <h1 className="mb-4 text-2xl tracking-tight">
                    404 Page Not Found
                  </h1>
                  <p className="mb-4">
                    Sorry, the page you are looking for does not exist. :(
                  </p>
                  <Link
                    href="/login"
                    className="text-[#1c6c91] hover:text-[#1f769e] hover:underline"
                  >
                    Go back
                  </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
