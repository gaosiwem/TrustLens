import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

async function proxyRequest(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const searchParams = new URL(req.url).search;
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const targetUrl = `${backendUrl}/notifications${searchParams}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${(session as any).accessToken}`);

    const contentType = req.headers.get("content-type");
    if (contentType) {
      headers.set("content-type", contentType);
    }

    const options: RequestInit = {
      method: req.method,
      headers: headers,
      cache: "no-store",
    };

    if (["POST", "PUT", "PATCH"].includes(req.method)) {
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
    console.error("Base Notifications API Bridge Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  return proxyRequest(req);
}

export async function POST(req: Request) {
  return proxyRequest(req);
}
