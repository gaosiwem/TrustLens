import nodemailer from "nodemailer";
import logger from "../../config/logger.js";
import dns from "dns/promises";

let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

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

  let resolvedHost = smtpHost;
  try {
    if (smtpHost !== "localhost" && smtpHost !== "127.0.0.1") {
      logger.info(`Resolving DNS for ${smtpHost}...`);
      const addresses = await dns.resolve4(smtpHost);
      if (addresses && addresses.length > 0) {
        resolvedHost = addresses[0];
        logger.info(`Resolved ${smtpHost} to IPv4: ${resolvedHost}`);
      } else {
        logger.warn(`No IPv4 addresses found for ${smtpHost}, using hostname.`);
      }
    }
  } catch (error) {
    logger.error(`DNS Resolution failed for ${smtpHost}:`, error);
    // Fallback to hostname
  }

  logger.info(
    `Initializing Email Transport: ${resolvedHost}:${smtpPort} (Secure: ${smtpSecure})`,
  );

  transporter = nodemailer.createTransport({
    host: resolvedHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Useful options for resilience
    connectionTimeout: 10000, // 10s timeout
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false, // Sometimes needed for self-signed or proxy certs, harmless for Gmail usually
    },
  } as any);

  return transporter;
}

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
      const emailTransporter = await getTransporter();
      const info = await emailTransporter.sendMail({
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
