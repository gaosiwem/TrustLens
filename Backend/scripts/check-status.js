import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function checkStatus() {
    const email = "manager@mitmakmotors.com";
    const user = await prisma.user.findUnique({
        where: { email },
        include: { managedBrands: true },
    });
    if (!user) {
        console.log("❌ User e2e_tester@example.com not found.");
        return;
    }
    console.log(`User: ${user.email} (${user.id})`);
    const brand = user.managedBrands[0];
    if (!brand) {
        console.log("❌ No managed brand found for user.");
        return;
    }
    console.log(`Brand: ${brand.name} (${brand.id})`);
    const requests = await prisma.verifiedRequest.findMany({
        where: { brandId: brand.id },
        orderBy: { createdAt: "desc" },
    });
    console.log(`\nVerification Requests (${requests.length}):`);
    requests.forEach((r) => {
        console.log(`- [${r.status}] ${r.companyName} (Documents: ${r.documents?.length || 0})`);
    });
    const subs = await prisma.brandSubscription.findMany({
        where: { brandId: brand.id },
        include: { plan: true },
    });
    console.log(`\nSubscriptions (${subs.length}):`);
    subs.forEach((s) => {
        console.log(`- [${s.status}] ${s.plan.code} (Ends: ${s.endsAt?.toISOString().split("T")[0]})`);
    });
}
checkStatus()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check-status.js.map