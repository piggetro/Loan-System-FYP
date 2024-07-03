import type { NextRequest } from "next/server";
import { api } from "@/trpc/server";

// Define an interface for the expected JSON structure
interface RequestBody {
  url: string;
}

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader?.includes("auth_session")) {
    const requestBody = (await request.json()) as RequestBody; // Safely cast after defining an expected type
    const data = await api.user.getAllAccessRights();
    // Ensure `data` and `requestBody.url` are properly checked
    if (
      data &&
      typeof requestBody.url === "string" &&
      data.includes(requestBody.url)
    ) {
      return new Response(null, {
        status: 200,
      });
    }
  }

  return new Response("Unathorised", {
    status: 401,
  });
}
