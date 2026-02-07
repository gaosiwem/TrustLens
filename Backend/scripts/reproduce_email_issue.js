import { prisma } from "../src/lib/prisma.js";
import { createComplaint } from "../src/modules/complaints/complaint.service.js";
import { notifyBrand } from "../src/modules/notifications/notification.service.js";
import { updateBrandAlertPrefs } from "../src/services/brandAlertPreference.service.js";
async function main() {
    console.log("Starting reproduction script...");
    // 1. Create a Test Brand Owner
    const ownerEmail = `test-owner-${Date.now()}@example.com`;
    const owner = await prisma.user.create({
        data: {
            email: ownerEmail,
            name: "Test Owner",
            role: "BRAND",
            password: "dummy",
        },
    });
    console.log(`Created Owner: ${owner.id}`);
    // 2. Create a Test Brand
    const brandName = `TestBrand-${Date.now()}`;
    const brand = await prisma.brand.create({
        data: {
            name: brandName,
            managerId: owner.id,
            isVerified: true,
        },
    });
    console.log(`Created Brand: ${brand.id}`);
    /*
    // 3. Add Owner as Brand Member
    await prisma.brandMember.create({
      data: {
        brandId: brand.id,
        userId: owner.id,
        role: "OWNER",
        isActive: true,
      },
    });
    console.log("Added Owner as Brand Member");
    */
    // 4. Create Active PRO Subscription
    const proPlan = await prisma.subscriptionPlan.findFirst({
        where: { code: "PRO_MONTHLY" }, // or whatever the code is
    });
    if (!proPlan) {
        // try finding any valueable plan if key not present
        console.warn("PRO_MONTHLY plan not found, searching for any plan with alerts");
        // Ideally we would create one, but let's see if we can just create a dummy one attached or use existing
    }
    else {
        await prisma.brandSubscription.create({
            data: {
                brandId: brand.id,
                planId: proPlan.id,
                status: "ACTIVE",
                startedAt: new Date(),
                endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
        });
        console.log("Created Active PRO Subscription");
    }
    // 5. Ensure Brand Alert Prefs enabled
    await updateBrandAlertPrefs(brand.id, {
        emailEnabled: true,
        complaintCreated: true,
    });
    console.log("Enabled Brand Alert Prefs");
    // 6. Create a Consumer User
    const consumer = await prisma.user.create({
        data: {
            email: `consumer-${Date.now()}@example.com`,
            name: "Test Consumer",
            role: "USER",
            password: "dummy",
        },
    });
    console.log(`Created Consumer: ${consumer.id}`);
    // 7. Create Complaint (which triggers notifyBrand)
    try {
        const complaint = await createComplaint({
            userId: consumer.id,
            brandName: brand.name,
            title: "Test Complaint by Script",
            description: "This is a test complaint to verify email generation.",
        });
        console.log(`Created Complaint: ${complaint.id}`);
    }
    catch (e) {
        console.error("Error creating complaint:", e);
    }
    // 8. Check EmailOutbox
    const emails = await prisma.emailOutbox.findMany({
        where: {
            toEmail: ownerEmail,
            subject: { contains: "New Complaint Received" },
        },
    });
    console.log("Checked EmailOutbox. Found:", emails.length);
    if (emails.length > 0) {
        console.log("SUCCESS: Email generated.");
        console.log(emails[0]);
    }
    else {
        console.log("FAILURE: No email generated.");
    }
}
main()
    .catch((e) => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=reproduce_email_issue.js.map