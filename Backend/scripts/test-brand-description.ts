import { updateBrandController } from "../src/modules/brands/brand.controller.js";
import { prisma } from "../src/lib/prisma.js";

// Mock Express Request/Response
const mockResponse = () => {
  const res: any = {};
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data: any) => {
    res.body = data;
    return res;
  };
  return res;
};

async function main() {
  console.log("🧪 Testing Custom Brand Description Restriction...");

  // 1. Setup Data
  const timestamp = Date.now();
  const brand = await prisma.brand.create({
    data: { name: `Test Brand ${timestamp}` },
  });

  const user = await prisma.user.create({
    data: {
      email: `tester${timestamp}@example.com`,
      name: "Tester",
      password: "hash",
      role: "BRAND",
    },
  });

  // Link manager
  await prisma.brand.update({
    where: { id: brand.id },
    data: { managerId: user.id },
  });

  // Create FREE Subscription
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { code: "FREE" },
    update: {},
    create: { code: "FREE", name: "Free Plan", monthlyPrice: 0, features: {} },
  });

  await prisma.brandSubscription.create({
    data: {
      brandId: brand.id,
      planId: freePlan.id,
      status: "ACTIVE",
      startedAt: new Date(),
    },
  });

  console.log(`✅ Setup: Created Brand ${brand.name} with FREE plan.`);

  // 2. Test FREE User Update
  console.log("👉 Attempting update as FREE user...");
  const reqFree = {
    params: { id: brand.id },
    body: { description: "I should not be able to set this." },
    user: { role: "BRAND", userId: user.id },
  } as any;
  const resFree = mockResponse();

  await updateBrandController(reqFree, resFree);

  if (resFree.statusCode === 403) {
    console.log("✅ SUCCESS: FREE user was blocked (403).");
  } else {
    console.error(
      `❌ FAILURE: FREE user got ${resFree.statusCode}`,
      resFree.body,
    );
  }

  // 3. Upgrade to PRO
  const proPlan = await prisma.subscriptionPlan.upsert({
    where: { code: "PRO" },
    update: {},
    create: { code: "PRO", name: "Pro Plan", monthlyPrice: 499, features: {} },
  });

  // Deactivate old sub
  await prisma.brandSubscription.updateMany({
    where: { brandId: brand.id },
    data: { status: "EXPIRED" },
  });

  // Create PRO sub
  await prisma.brandSubscription.create({
    data: {
      brandId: brand.id,
      planId: proPlan.id,
      status: "ACTIVE",
      startedAt: new Date(),
    },
  });
  console.log("🔄 Upgraded to PRO.");

  // 4. Test PRO User Update
  console.log("👉 Attempting update as PRO user...");
  const reqPro = {
    params: { id: brand.id },
    body: { description: "I am a PRO brand and this is my story." },
    user: { role: "BRAND", userId: user.id },
  } as any;
  const resPro = mockResponse();

  await updateBrandController(reqPro, resPro);

  if (resPro.body?.description === "I am a PRO brand and this is my story.") {
    console.log("✅ SUCCESS: PRO user updated description.");
  } else {
    console.error(
      `❌ FAILURE: PRO user update failed. Status: ${resPro.statusCode}`,
      resPro.body,
    );
  }

  // Cleanup
  await prisma.brandSubscription.deleteMany({ where: { brandId: brand.id } });
  await prisma.brand.delete({ where: { id: brand.id } });
  await prisma.user.delete({ where: { id: user.id } });
}

main().catch((err) => console.error(err));
