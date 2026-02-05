import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import logger from "../config/logger.js";
import { EmailTemplates } from "./email/emailTemplates.js";
import { EmailOutboxService } from "./emailOutbox.service.js";

export class CronService {
  static init() {
    logger.info("[CronService] Initializing scheduled jobs...");

    // Run every day at 08:00 AM
    cron.schedule("0 8 * * *", async () => {
      logger.info("[CronService] Running daily complaint reminder job...");
      await this.processComplaintReminders();
    });

    // Run Quarterly Audit (1st Jan, Apr, Jul, Oct at 09:00 AM)
    cron.schedule("0 9 1 1,4,7,10 *", async () => {
      logger.info("[CronService] Running quarterly brand health audit...");
      await this.processQuarterlyAudits();
    });

    logger.info("[CronService] Scheduled jobs initialized.");
  }

  static async processComplaintReminders() {
    try {
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

      // Find complaints that need reminders
      // 1. Status is SUBMITTED or INFO_PROVIDED
      // 2. Created (for SUBMITTED) or Updated (for INFO_PROVIDED) > 48h ago
      // 3. Not reminded recently (or never) - assuming 7 day re-reminder interval if we wanted recursive,
      //    but initially just checking if it's pending long enough.
      //    Let's stick to the 48h rule for the first reminder.

      const complaints = await prisma.complaint.findMany({
        where: {
          status: { in: ["SUBMITTED", "INFO_PROVIDED"] },
          OR: [
            // Case 1: Initial Reminder for SUBMITTED (based on Creation time)
            {
              status: "SUBMITTED",
              createdAt: { lt: fortyEightHoursAgo },
              lastRemindedAt: null,
            },
            // Case 2: Reminder for INFO_PROVIDED (based on Last Update time - i.e. when user replied)
            {
              status: "INFO_PROVIDED",
              updatedAt: { lt: fortyEightHoursAgo },
              lastRemindedAt: null,
            },
            // Case 3: Recurring Weekly Reminder (if already reminded)
            {
              status: { in: ["SUBMITTED", "INFO_PROVIDED"] },
              lastRemindedAt: {
                lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          ],
        },
        include: {
          brand: true,
        },
      });

      logger.info(
        `[CronService] Found ${complaints.length} complaints needing reminders.`,
      );

      for (const complaint of complaints) {
        if (!complaint.brand?.supportEmail) {
          logger.warn(
            `[CronService] Skipping complaint ${complaint.id} - No brand support email.`,
          );
          continue;
        }

        try {
          const email = EmailTemplates.getComplaintReminderEmail(
            complaint.brand.name,
            complaint,
          );

          await EmailOutboxService.enqueueEmail({
            toEmail: complaint.brand.supportEmail,
            subject: email.subject,
            htmlBody: email.htmlBody,
            textBody: email.textBody,
            brandId: complaint.brandId,
            attachments: email.attachments,
          });

          await prisma.complaint.update({
            where: { id: complaint.id },
            data: { lastRemindedAt: new Date() },
          });

          logger.info(
            `[CronService] Sent reminder for complaint ${complaint.id} to ${complaint.brand.supportEmail}`,
          );
        } catch (err) {
          logger.error(
            `[CronService] Failed to process reminder for complaint ${complaint.id}:`,
            err,
          );
        }
      }
    } catch (error) {
      logger.error("[CronService] Error in complaint reminder job:", error);
    }
  }
  static async processQuarterlyAudits() {
    try {
      // 1. Determine Quarter Range (Last completed quarter)
      const now = new Date();
      // If running on Jan 1st, we want Oct-Dec of previous year.
      // Simply: Set date to 0 (last day of prev month), then subtract 3 months.
      const quarterEnd = new Date(now.getFullYear(), now.getMonth(), 0); // e.g., Set to Mar 31 if running Apr 1
      const quarterStart = new Date(quarterEnd);
      quarterStart.setMonth(quarterStart.getMonth() - 2);
      quarterStart.setDate(1); // 1st of that month

      const quarterName = `Q${Math.ceil((quarterEnd.getMonth() + 1) / 3)} ${quarterEnd.getFullYear()}`; // e.g., Q1 2024

      logger.info(
        `[CronService] Generating Audits for: ${quarterName} (${quarterStart.toISOString().split("T")[0]} - ${quarterEnd.toISOString().split("T")[0]})`,
      );

      // 2. Find Eligible Brands (PRO, BUSINESS, ENTERPRISE, PREMIUM_VERIFIED)
      // We need to look at Active Subscriptions.
      const subs = await prisma.brandSubscription.findMany({
        where: {
          status: "ACTIVE",
          plan: {
            code: { in: ["PRO", "BUSINESS", "ENTERPRISE", "PREMIUM_VERIFIED"] },
          },
        },
        include: { brand: true, plan: true },
      });

      logger.info(
        `[CronService] Found ${subs.length} eligible subscriptions for audit.`,
      );

      // 3. Import Services dynamically to avoid circular dependecy issues if any (though likely fine)
      const { AuditService } = await import("./analytics/audit.service.js");
      const { AuditPdfService } =
        await import("./analytics/audit-pdf.service.js");

      for (const sub of subs) {
        if (!sub.brand.supportEmail) continue;

        try {
          // Generate Data
          const auditData = await AuditService.generateAuditData(
            sub.brandId,
            quarterStart,
            quarterEnd,
          );

          // Generate PDF
          const pdfBuffer = await AuditPdfService.generateAuditPDF(auditData);

          // Prepare Email
          const email = EmailTemplates.getBrandAuditEmail(
            sub.brand.name,
            pdfBuffer,
            quarterName,
          );

          // Send
          await EmailOutboxService.enqueueEmail({
            toEmail: sub.brand.supportEmail,
            subject: email.subject,
            htmlBody: email.htmlBody,
            textBody: email.textBody,
            brandId: sub.brandId,
            attachments: email.attachments,
          });

          logger.info(
            `[CronService] Sent audit to ${sub.brand.name} (${sub.brand.supportEmail})`,
          );
        } catch (err) {
          logger.error(
            `[CronService] Failed to generate audit for ${sub.brand.name}:`,
            err,
          );
        }
      }
    } catch (error) {
      logger.error("[CronService] Error in quarterly audit job:", error);
    }
  }
}
