import { CronService } from "../src/services/cron.service.js";
import { EmailOutboxService } from "../src/services/emailOutbox.service.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  console.log("🕰️ Starting Audit Logic Test...");

  // Mock Enqueue
  const originalEnqueue = EmailOutboxService.enqueueEmail;
  let emailSent = false;
  EmailOutboxService.enqueueEmail = async (args) => {
    console.log("📧 Email Outbox Intercepted:", args.subject);
    console.log("   - To:", args.toEmail);
    console.log("   - Attachments:", args.attachments.length);
    emailSent = true;
    return originalEnqueue(args);
  };

  try {
    // 1. Ensure Checkers has an implementation
    // We recently ran a script to give them PREMIUM_VERIFIED, so they should be eligible.

    console.log("🚀 Running processQuarterlyAudits()...");
    // NOTE: This will attempt to run for the *previous* quarter relative to today.
    // If today is Jan 28, 2026, it will try to define the previous quarter ending Dec 31, 2025.
    // Ensure there is data or else the report might be empty (which is fine for a test of the pipeline).
    await CronService.processQuarterlyAudits();

    if (emailSent) {
      console.log("✅ SUCCESS: Email sent!");
    } else {
      console.warn(
        "⚠️ NO EMAIL SENT. Check if any brands matched the PRO/VERIFIED criteria.",
      );

      const subs = await prisma.brandSubscription.findMany({
        where: {
          status: "ACTIVE",
          plan: {
            code: { in: ["PRO", "BUSINESS", "ENTERPRISE", "PREMIUM_VERIFIED"] },
          },
        },
        include: { brand: true },
      });
      console.log(
        "DEBUG: Found Active Subs:",
        subs.map((s) => `${s.brand.name} (${s.planId})`),
      );
    }
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    process.exit(0);
  }
}

main();
