import { Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import nodemailer from "nodemailer";
import { prisma } from "../lib/prisma.js";
import { EmailOutboxService } from "../services/emailOutbox.service.js";
import logger from "../config/logger.js";

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "1025"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

let emailWorker: Worker | null = null;

function createConnection(): Redis | null {
  try {
    const connection = new Redis(
      process.env.REDIS_URL || "redis://localhost:6379",
      {
        maxRetriesPerRequest: null,
        lazyConnect: true,
        retryStrategy: (times: number) => {
          if (times > 3) {
            logger.warn(
              "Email worker: Redis connection failed after 3 retries",
            );
            return null;
          }
          return Math.min(times * 200, 2000);
        },
      },
    );

    connection.on("error", (err) => {
      logger.error("Email worker Redis error:", err.message);
    });

    return connection;
  } catch (error) {
    logger.error("Failed to create Redis connection for email worker:", error);
    return null;
  }
}

export function initEmailWorker(): Worker | null {
  if (emailWorker) return emailWorker;

  const connection = createConnection();
  if (!connection) {
    logger.warn("Email worker not started: Redis unavailable");
    return null;
  }

  try {
    emailWorker = new Worker(
      "emailQueue",
      async (job: Job) => {
        const { outboxId } = job.data;

        const outboxItem = await prisma.emailOutbox.findUnique({
          where: { id: outboxId },
        });

        if (!outboxItem) {
          logger.error(`Email outbox item ${outboxId} not found`);
          return;
        }

        if (outboxItem.status === "SENT") {
          return;
        }

        try {
          await transporter.sendMail({
            from:
              process.env.EMAIL_FROM || '"TrustLens" <noreply@trustlens.com>',
            to: outboxItem.toEmail,
            subject: outboxItem.subject,
            text: outboxItem.textBody ?? "",
            html: outboxItem.htmlBody,
          });

          await EmailOutboxService.updateStatus(outboxId, "SENT");
          logger.info(
            `Successfully sent email ${outboxId} to ${outboxItem.toEmail}`,
          );
        } catch (error: any) {
          logger.error(`Failed to send email ${outboxId}:`, error);

          // If we've tried too many times, mark as FAILED
          if (outboxItem.attempts >= 5) {
            await EmailOutboxService.updateStatus(
              outboxId,
              "FAILED",
              error.message,
            );
          } else {
            // Otherwise, mark as pending for BullMQ retry logic or manual retry
            await EmailOutboxService.markForRetry(outboxId, error.message);
            throw error; // Re-throw so BullMQ knows it failed
          }
        }
      },
      {
        connection: connection as any,
        concurrency: 5,
      },
    );

    emailWorker.on("completed", (job) => {
      logger.info(`Email job ${job.id} completed`);
    });

    emailWorker.on("failed", (job, err) => {
      logger.error(`Email job ${job?.id} failed:`, err);
    });

    logger.info("Email worker initialized successfully");
    return emailWorker;
  } catch (error) {
    logger.error("Failed to initialize email worker:", error);
    return null;
  }
}

// Export for backwards compatibility
export { emailWorker };
