import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

async function proxyRequest(
  req: Request,
  pathArray: string[],
  resource: string,
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const path = pathArray.join("/");
    const searchParams = new URL(req.url).search;

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    // Map 'brand' to 'brands' for backend
    const backendResource = resource === "brand" ? "brands" : resource;
    const targetUrl = `${backendUrl}/${backendResource}/${path}${searchParams}`;

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${(session as any).accessToken}`);

    // Copy content-type if it exists
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
    console.error(`API Bridge Error (${resource}):`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  props: { params: Promise<{ path: string[] }> },
) {
  const params = await props.params;
  return proxyRequest(req, params.path, "brand");
}

export async function POST(
  req: Request,
  props: { params: Promise<{ path: string[] }> },
) {
  const params = await props.params;
  return proxyRequest(req, params.path, "brand");
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ path: string[] }> },
) {
  const params = await props.params;
  return proxyRequest(req, params.path, "brand");
}

export async function PUT(
  req: Request,
  props: { params: Promise<{ path: string[] }> },
) {
  const params = await props.params;
  return proxyRequest(req, params.path, "brand");
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ path: string[] }> },
) {
  const params = await props.params;
  return proxyRequest(req, params.path, "brand");
}
