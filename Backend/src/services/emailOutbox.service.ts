import { prisma } from "../lib/prisma.js";
import { getEmailQueue } from "../queues/email.queue.js";
import { EmailTransport } from "../services/email/emailTransport.js";
import logger from "../config/logger.js";

export class EmailOutboxService {
  /**
   * Enqueues an email into the outbox and the BullMQ queue.
   */
  static async enqueueEmail(data: {
    brandId?: string;
    toEmail: string;
    subject: string;
    htmlBody: string;
    textBody: string;
    attachments?: {
      filename: string;
      content: Buffer | string;
      encoding?: string;
    }[];
  }) {
    // 1. Create Outbox Item
    const outboxItem = await prisma.emailOutbox.create({
      data: {
        brandId: data.brandId || "SYSTEM",
        toEmail: data.toEmail,
        subject: data.subject,
        htmlBody: data.htmlBody,
        textBody: data.textBody,
        status: "PENDING",
      },
    });

    // 2. Prepare Attachments (if any)
    const attachmentsPayload = data.attachments?.map((att) => ({
      filename: att.filename,
      content: Buffer.isBuffer(att.content)
        ? att.content.toString("base64")
        : att.content,
      encoding: "base64",
    }));

    // 3. Add to BullMQ
    const queue = getEmailQueue();
    if (queue) {
      try {
        await queue.add(
          "sendEmail",
          {
            outboxId: outboxItem.id,
            attachments: attachmentsPayload, // Pass attachments to worker
          },
          {
            attempts: 3,
            backoff: { type: "exponential", delay: 1000 },
            removeOnComplete: true,
          },
        );
      } catch (error) {
        logger.error(`Failed to add email ${outboxItem.id} to queue:`, error);
      }
    } else {
      logger.warn(
        `Email queue not available. Attempting direct send for ${outboxItem.id}...`,
      );
      try {
        await EmailTransport.send({
          to: outboxItem.toEmail,
          subject: outboxItem.subject,
          text: outboxItem.textBody ?? "",
          html: outboxItem.htmlBody,
          attachments: attachmentsPayload, // Pass attachments to transport
        });
        await this.updateStatus(outboxItem.id, "SENT");
        logger.info(`Directly sent email ${outboxItem.id}`);
      } catch (error: any) {
        logger.error(`Direct send failed for ${outboxItem.id}:`, error);
        await this.updateStatus(outboxItem.id, "FAILED", error.message);
      }
    }

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
