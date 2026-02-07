import prisma from "../src/lib/prisma.js";
import { notifyBrand } from "../src/modules/notifications/notification.service.js";
async function main() {
    console.log("🚀 Starting verification status email test...");
    // Setup Test Data
    const email = "gaosiwem@gmail.com";
    // Upsert user to ensure existence without failure
    const user = await prisma.user.upsert({
        where: { email },
        update: { role: "BRAND" },
        create: {
            email,
            name: "Gaosiwem Test",
            role: "BRAND",
            password: "hashed_dummy",
        },
    });
    const brand = await prisma.brand.create({
        data: {
            name: "Verified Brand " + Date.now(),
            managerId: user.id,
        },
    });
    // Create BrandMember to receive notification (since notifyBrand checks members usually)
    // Actually notifyBrand checks alert preferences. If no preferences, it might default to manager?
    // Let's create preference to be safe.
    await prisma.brandAlertPreference.create({
        data: {
            brandId: brand.id,
            emailEnabled: true,
            inAppEnabled: true,
            statusChanges: true, // Enable status changes just in case
        },
    });
    // Verify Approved Email
    console.log("Testing APPROVED notification...");
    await notifyBrand({
        brandId: brand.id,
        type: "SYSTEM_UPDATE",
        title: "Verification Request Approved",
        body: "Your verification request has been approved.",
        link: "/brand/settings",
    });
    // Check Outbox
    await new Promise((r) => setTimeout(r, 1000));
    const approvedEmail = await prisma.emailOutbox.findFirst({
        where: {
            toEmail: email,
            subject: { contains: "Approved", mode: "insensitive" },
            createdAt: { gt: new Date(Date.now() - 5000) },
        },
    });
    if (approvedEmail) {
        console.log("✅ SUCCESS: 'Approved' email found.");
    }
    else {
        console.error("❌ FAILED: 'Approved' email not found.");
        process.exit(1);
    }
    // Cleanup
    await prisma.brandAlertPreference.delete({ where: { brandId: brand.id } });
    await prisma.brand.delete({ where: { id: brand.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log("Cleanup done.");
}
main().catch(console.error);
//# sourceMappingURL=verify-verification-status.js.map