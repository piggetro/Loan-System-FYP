import { verifyRequestOrigin } from "lucia";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.method !== "GET") {
    const originHeader = request.headers.get("Origin");
    // NOTE: You may need to use `X-Forwarded-Host` instead
    const hostHeader = request.headers.get("Host");
    if (
      !originHeader ||
      !hostHeader ||
      !verifyRequestOrigin(originHeader, [hostHeader])
    ) {
      return new NextResponse(null, {
        status: 403,
      });
    }
  }

  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader?.includes("auth_session")) {
    request.headers.delete("content-length");
    const checkAuthorisation = await fetch(`${process.env.DOMAIN}/api/prisma`, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify({
        url: "/" + request.nextUrl.pathname.split("/").slice(1, 3).join("/"),
      }),
    });

    if (checkAuthorisation.status !== 200)
      return NextResponse.redirect(new URL("/not-found", request.url));

    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Login
     * - Register
     */
    "/((?!api|_next/static|_next/image|login|register|not-found|favicon.ico).*)",
  ],
};
