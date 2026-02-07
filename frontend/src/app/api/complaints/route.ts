import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

async function proxyRequest(req: Request, pathArray: string[]) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const path = (pathArray || []).join("/");
    const searchParams = new URL(req.url).search;

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const targetUrl = `${backendUrl}/complaints/${path}${searchParams}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${(session as any).accessToken}`);

    // Copy content-type if it exists, but handle multipart separately if needed
    // Actually fetch handles FormData automatically if body is FormData
    const contentType = req.headers.get("content-type");
    if (contentType && !contentType.includes("multipart/form-data")) {
      headers.set("content-type", contentType);
    }

    const options: RequestInit = {
      method: req.method,
      headers: headers,
      cache: "no-store",
    };

    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      // For multipart/form-data, we shouldn't set the content-type manually
      // as fetch will do it with the correct boundary.
      // But here we are proxying from an incoming request.
      options.body = await req.arrayBuffer();
    }

    const response = await fetch(targetUrl, options);

    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(errorText, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Complaints API Bridge Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  return proxyRequest(req, []);
}

export async function POST(req: Request) {
  return proxyRequest(req, []);
}

// Support requests to /api/complaints (no subpath)
export async function PATCH(req: Request) {
  return proxyRequest(req, []);
}
