import nodemailer from "nodemailer";
import logger from "../../config/logger.js";

// Create Nodemailer transporter
const smtpHost = process.env.SMTP_HOST || "localhost";
const smtpPort = parseInt(process.env.SMTP_PORT || "1025");
let smtpSecure = process.env.SMTP_SECURE === "true";

// Auto-fix common configuration errors
if (smtpPort === 587 && smtpSecure) {
  logger.warn(
    "SMTP Config Warning: Port 587 typically requires secure: false (STARTTLS). Overriding SMTP_SECURE to false.",
  );
  smtpSecure = false;
}

if (smtpPort === 465 && !smtpSecure) {
  logger.warn(
    "SMTP Config Warning: Port 465 typically requires secure: true (SMTPS). Overriding SMTP_SECURE to true.",
  );
  smtpSecure = true;
}

logger.info(
  `Initializing Email Transport: ${smtpHost}:${smtpPort} (Secure: ${smtpSecure})`,
);

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Force IPv4 to avoid timeouts in some container environments
  // @ts-ignore
  family: 4,
});

export const EmailTransport = {
  send: async (params: {
    to: string;
    subject: string;
    html: string;
    text: string;
    from?: string;
    attachments?: {
      filename: string;
      content: Buffer | string;
      encoding?: string;
    }[];
  }) => {
    try {
      const info = await transporter.sendMail({
        from:
          params.from ||
          process.env.EMAIL_FROM ||
          '"TrustLens" <noreply@trustlens.com>',
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
        attachments: params.attachments,
      });
      return info;
    } catch (error) {
      logger.error("EmailTransport send failed:", error);
      throw error;
    }
  },
};
