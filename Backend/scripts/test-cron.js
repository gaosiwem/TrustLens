import { CronService } from "../src/services/cron.service.js"; // Keep .js for internal consistency if project uses it, but let's try .ts for tsx
import { prisma } from "../src/lib/prisma.js";
import { EmailOutboxService } from "../src/services/emailOutbox.service.js";
async function main() {
    console.log("🕰️ Starting Cron Logic Test...");
    console.log("Database URL:", process.env.DATABASE_URL ? "Defined" : "Undefined");
    // Mock Enqueue to spy on calls (optional, but good for verification)
    const originalEnqueue = EmailOutboxService.enqueueEmail;
    let emailSent = false;
    EmailOutboxService.enqueueEmail = async (args) => {
        console.log("📧 Email Outbox Intercepted:", args.subject);
        emailSent = true;
        return originalEnqueue(args);
    };
    try {
        // 1. Setup Data: Find a brand with email
        console.log("🔍 Finding a test brand...");
        const brand = await prisma.brand.findFirst({
            where: { supportEmail: { not: null } },
        });
        if (!brand || !brand.supportEmail) {
            console.error("❌ No brand with support email found. Cannot test.");
            return;
        }
        console.log(`✅ Using Brand: ${brand.name} (${brand.supportEmail})`);
        // 2. Setup Data: Find a user
        const user = await prisma.user.findFirst();
        if (!user) {
            console.error("❌ No user found. Cannot test.");
            return;
        }
        // 3. Create a Stale Complaint
        console.log("📝 Creating stale complaint > 48h old...");
        const staleDate = new Date(Date.now() - 50 * 60 * 60 * 1000); // 50 hours ago
        const complaint = await prisma.complaint.create({
            data: {
                title: "Test Complaint for Cron " + Date.now(),
                description: "This should trigger a reminder.",
                userId: user.id,
                brandId: brand.id,
                status: "SUBMITTED",
                createdAt: staleDate,
                lastRemindedAt: null,
            },
        });
        // 4. Run the Job
        console.log("🚀 Running processComplaintReminders()...");
        await CronService.processComplaintReminders();
        // 5. Verify
        const updatedComplaint = await prisma.complaint.findUnique({
            where: { id: complaint.id },
        });
        if (emailSent && updatedComplaint?.lastRemindedAt) {
            console.log("✅ SUCCESS: Email sent and lastRemindedAt updated!");
        }
        else {
            console.error("❌ FAILURE:");
            console.error(`   - Email Sent: ${emailSent}`);
            console.error(`   - Reminded At: ${updatedComplaint?.lastRemindedAt}`);
        }
        // Cleanup
        await prisma.complaint.delete({ where: { id: complaint.id } });
        console.log("🧹 Cleanup complete.");
    }
    catch (err) {
        console.error("❌ Error:", err);
    }
    finally {
        process.exit(0);
    }
}
main();
//# sourceMappingURL=test-cron.js.map