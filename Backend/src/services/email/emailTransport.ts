import nodemailer from "nodemailer";
import logger from "../../config/logger.js";

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
