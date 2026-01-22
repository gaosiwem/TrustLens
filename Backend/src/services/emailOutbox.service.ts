import { prisma } from "../lib/prisma.js";
import { emailQueue } from "../queues/email.queue.js";

export class EmailOutboxService {
  /**
   * Enqueues an email into the outbox and the BullMQ queue.
   */
  static async enqueueEmail(params: {
    brandId?: string;
    toEmail: string;
    subject: string;
    htmlBody: string;
    textBody: string;
  }) {
    const outboxItem = await prisma.emailOutbox.create({
      data: {
        brandId: params.brandId || "SYSTEM", // Fallback if missing
        toEmail: params.toEmail,
        subject: params.subject,
        htmlBody: params.htmlBody,
        textBody: params.textBody,
        status: "PENDING",
      },
    });

    // Add to BullMQ queue for processing
    await emailQueue.add("sendEmail", {
      outboxId: outboxItem.id,
    });

    return outboxItem;
  }

  /**
   * Updates the status of an outbox item.
   */
  static async updateStatus(
    id: string,
    status: "SENT" | "FAILED",
    error?: string,
  ) {
    return prisma.emailOutbox.update({
      where: { id },
      data: {
        status,
        sentAt: status === "SENT" ? new Date() : null,
        lastError: error ?? null,
        attempts: { increment: 1 },
      },
    });
  }

  /**
   * Increments attempt count and sets status to PENDING for retry.
   */
  static async markForRetry(id: string, error: string) {
    return prisma.emailOutbox.update({
      where: { id },
      data: {
        status: "PENDING",
        lastError: error,
        attempts: { increment: 1 },
      },
    });
  }
}
