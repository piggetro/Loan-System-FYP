import { verifyRequestOrigin } from "lucia";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    console.log("Pathname", request.nextUrl.pathname);

    const session = await prisma.session.findUnique({
      where: {
        id: request.cookies.get("auth_session")?.value,
      },
    });
    

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
    "/((?!api|_next/static|_next/image|login|register|favicon.ico).*)",
  ],
};
