import { prisma } from "../../lib/prisma.js";
import { ensureBrandAlertPrefs } from "../../services/brandAlertPreference.service.js";
import { EmailOutboxService } from "../../services/emailOutbox.service.js";

type NotifyBrandArgs = {
  brandId: string;
  userId?: string | null;
  type:
    | "COMPLAINT_CREATED"
    | "COMPLAINT_ESCALATED"
    | "NEW_CONSUMER_MESSAGE"
    | "STATUS_CHANGED"
    | "EVIDENCE_ADDED"
    | "SYSTEM_ALERT";
  title: string;
  body: string;
  link?: string;
  metadata?: Record<string, any>;
};

/**
 * Notifies a brand (and its members) based on their alert preferences.
 */
export async function notifyBrand(args: NotifyBrandArgs) {
  const prefs = await ensureBrandAlertPrefs(args.brandId);

  const eventMatched =
    (args.type === "COMPLAINT_CREATED" && prefs.complaintCreated) ||
    (args.type === "COMPLAINT_ESCALATED" && prefs.escalations) ||
    (args.type === "NEW_CONSUMER_MESSAGE" && prefs.newMessages) ||
    (args.type === "STATUS_CHANGED" && prefs.statusChanges) ||
    (args.type === "EVIDENCE_ADDED" && prefs.evidenceAdded) ||
    args.type === "SYSTEM_ALERT";

  const shouldInApp = prefs.inAppEnabled && eventMatched;
  const shouldEmail = prefs.emailEnabled && eventMatched;

  if (shouldInApp) {
    await prisma.notification.create({
      data: {
        brandId: args.brandId,
        userId: args.userId ?? null,
        type: args.type,
        title: args.title,
        body: args.body,
        link: args.link ?? null,
        metadata: args.metadata ?? (prisma as any).JsonNull,
      },
    });
  }

  if (shouldEmail) {
    // Get brand members to email
    const members = await prisma.brandMember.findMany({
      where: { brandId: args.brandId, isActive: true },
      include: { user: { select: { email: true } } },
    });

    const toEmails = members.map((m) => m.user.email);

    if (toEmails.length > 0) {
      const subject = `[TrustLens] ${args.title}`;
      const textBody = `${args.body}\n\n${args.link ?? ""}`.trim();
      const htmlBody = `
        <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:600px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background-color:#13b6ec;padding:24px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;">TrustLens</h1>
          </div>
          <div style="padding:32px;background-color:#ffffff;">
            <h2 style="margin:0 0 16px 0;color:#111618;">${escapeHtml(args.title)}</h2>
            <p style="margin:0 0 24px 0;color:#637588;font-size:16px;">${escapeHtml(args.body)}</p>
            ${
              args.link
                ? `<div style="text-align:center;margin-top:32px;">
                    <a href="${args.link}" style="background-color:#13b6ec;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">View Details</a>
                  </div>`
                : ""
            }
          </div>
          <div style="background-color:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="color:#93a2b7;font-size:12px;margin:0;">
              You are receiving this because alerts are enabled for your brand on TrustLens.
            </p>
          </div>
        </div>
      `.trim();

      for (const toEmail of toEmails) {
        await EmailOutboxService.enqueueEmail({
          brandId: args.brandId,
          toEmail,
          subject,
          htmlBody,
          textBody,
        });
      }
    }
  }
}

/**
 * Creates a notification for a specific user.
 */
export async function createUserNotification(params: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string;
  metadata?: any;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
      metadata: params.metadata,
    },
  });
}

export async function getNotifications(
  userId?: string,
  brandId?: string,
  cursor?: string,
  limit = 10,
) {
  return prisma.notification.findMany({
    where: {
      OR: [userId ? { userId } : {}, brandId ? { brandId } : {}].filter(
        (q) => Object.keys(q).length > 0,
      ) as any,
    },
    take: limit,
    skip: cursor ? 1 : 0,
    ...(cursor && { cursor: { id: cursor } }),
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { read: true, readAt: new Date() },
  });
}

export async function markAllNotificationsRead(params: {
  userId?: string;
  brandId?: string;
}) {
  return prisma.notification.updateMany({
    where: {
      userId: params.userId,
      brandId: params.brandId,
      read: false,
    },
    data: { read: true, readAt: new Date() },
  });
}

export async function getUnreadCount(params: {
  userId?: string;
  brandId?: string;
}) {
  return prisma.notification.count({
    where: {
      userId: params.userId,
      brandId: params.brandId,
      read: false,
    },
  });
}

export async function getNotificationPreferences(userId: string) {
  let prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: {
        userId,
        emailEnabled: true,
        pushEnabled: true,
      },
    });
  }

  return prefs;
}

export async function updateNotificationPreferences(
  userId: string,
  emailEnabled: boolean,
  pushEnabled: boolean,
) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    create: {
      userId,
      emailEnabled,
      pushEnabled,
    },
    update: {
      emailEnabled,
      pushEnabled,
    },
  });
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
