import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; // Verify path. Usually src/lib/authOptions or similar.
// Note: In Sprint31.md it was "@/lib/authOptions".
// But project structure often has it in @/app/api/auth/[...nextauth]/route.ts or similar.
// Looking at file tree: frontend/lib/authOptions.ts exists ?
import { z } from "zod";

const Schema = z.object({
  allowedDomains: z.array(z.string()).default([]),
  widgetWatermark: z.boolean().optional(),
  widgetRoutingEnabled: z.boolean().optional(),
  defaultTheme: z.enum(["light", "dark"]).optional(),
});

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 });

  // Get brand ID from user?
  // We need to know which brand the user manages.
  // Assuming session.user has brandId or we look up managed brand.

  // Implementation note: Ideally we fetch the brand the user is managing.
  // If session.user.id is managerId:
  const user = await db.user.findUnique({
    where: { email: session.user.email! },
    include: { managedBrands: true },
  });

  if (!user || user.managedBrands.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No brand found" },
      { status: 404 },
    );
  }

  // Updating first managed brand for simplicity/MVP
  const brandId = user.managedBrands[0].id;

  try {
    const body = Schema.parse(await req.json());

    await db.brand.update({
      where: { id: brandId },
      data: {
        allowedDomains: body.allowedDomains,
        widgetWatermark: body.widgetWatermark,
        widgetRoutingEnabled: body.widgetRoutingEnabled,
        defaultTheme: body.defaultTheme,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e }, { status: 400 });
  }
}
