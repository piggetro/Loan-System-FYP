import type { NextRequest } from "next/server";
import { api } from "@/trpc/server";

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader?.includes("auth_session")) {
    const { url } = await request.json();
    const data = await api.user.getAllAccessRights();
    if (data?.includes(url)) {
      return new Response(null, {
        status: 200,
      });
    }
  }

  return new Response("Unathorised", {
    status: 401,
  });
}
