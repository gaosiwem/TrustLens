import { prisma } from "../../lib/prisma.js";
import { ensureBrandAlertPrefs } from "../../services/brandAlertPreference.service.js";
import { EmailOutboxService } from "../../services/emailOutbox.service.js";
import { EmailTemplates } from "../../services/email/emailTemplates.js";

type NotifyBrandArgs = {
  brandId: string;
  userId?: string | null;
  type:
    | "COMPLAINT_CREATED"
    | "COMPLAINT_ESCALATED"
    | "NEW_CONSUMER_MESSAGE"
    | "STATUS_CHANGED"
    | "EVIDENCE_ADDED"
    | "SYSTEM_ALERT"
    | "NEGATIVE_SENTIMENT"
    | "URGENCY_ALERT"
    | "SYSTEM_UPDATE";
  title: string;
  body: string;
  link?: string;
  metadata?: Record<string, any>;
  reviewRating?: number;
  reviewComment?: string;
};

/**
 * Notifies a brand (and its members) based on their alert preferences.
 * - COMPLAINT_CREATED & SYSTEM_ALERT: Sent to ALL brands (Free & Pro).
 * - All other types: Sent ONLY if the brand has the 'alerts' feature (Pro/Business).
 */
export async function notifyBrand(args: NotifyBrandArgs) {
  const prefs = await ensureBrandAlertPrefs(args.brandId);

  // Check subscription feature for alerts
  const subscription = await prisma.brandSubscription.findFirst({
    where: { brandId: args.brandId, status: "ACTIVE" },
    include: { plan: true },
  });

  const hasAlertsFeature =
    subscription?.plan.features &&
    (subscription.plan.features as any).alerts === true;

  // Determine if this is a "Free Tier" critical alert
  const isCriticalAlert =
    args.type === "COMPLAINT_CREATED" ||
    args.type === "SYSTEM_ALERT" ||
    args.type === "SYSTEM_UPDATE";

  // Gate: Only send non-critical alerts if brand has Pro features
  if (!isCriticalAlert && !hasAlertsFeature) {
    return;
  }

  const eventMatched =
    (args.type === "COMPLAINT_CREATED" && prefs.complaintCreated) ||
    (args.type === "COMPLAINT_ESCALATED" && prefs.escalations) ||
    (args.type === "NEW_CONSUMER_MESSAGE" && prefs.newMessages) ||
    (args.type === "STATUS_CHANGED" && prefs.statusChanges) ||
    (args.type === "EVIDENCE_ADDED" && prefs.evidenceAdded) ||
    args.type === "SYSTEM_ALERT" ||
    args.type === "NEGATIVE_SENTIMENT" ||
    args.type === "URGENCY_ALERT" ||
    args.type === "SYSTEM_UPDATE";

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

    const toEmails = new Set(members.map((m) => m.user.email));

    // Ensure the Brand Manager is included (fallback if they are not in BrandMember table)
    const brand = await prisma.brand.findUnique({
      where: { id: args.brandId },
      include: { manager: { select: { email: true } } },
    });

    if (brand?.manager?.email) {
      toEmails.add(brand.manager.email);
    }

    if (toEmails.size > 0) {
      const { subject, htmlBody, textBody, attachments } =
        EmailTemplates.getNotificationEmail({
          type: args.type,
          title: args.title,
          body: args.body,
          ...(args.link ? { link: args.link } : {}),
          reviewRating: args.reviewRating,
          reviewComment: args.reviewComment,
        } as any);

      for (const toEmail of toEmails) {
        await EmailOutboxService.enqueueEmail({
          brandId: args.brandId,
          toEmail,
          subject,
          htmlBody,
          textBody,
          attachments,
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
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link ?? null,
      metadata: params.metadata,
    },
  });

  // Check email preference
  const prefs = await getNotificationPreferences(params.userId);

  if (prefs.emailEnabled) {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { email: true },
    });

    if (user?.email) {
      const { subject, htmlBody, textBody, attachments } =
        EmailTemplates.getConsumerNotificationEmail({
          type: params.type,
          title: params.title,
          body: params.body,
          ...(params.link ? { link: params.link } : {}),
        });

      await EmailOutboxService.enqueueEmail({
        // userId: params.userId, // Not supported by EmailOutbox yet, defaults to SYSTEM brand
        toEmail: user.email,
        subject,
        htmlBody,
        textBody,
        attachments,
      });
    }
  }

  return notification;
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
  const where: any = {
    read: false,
  };
  if (params.userId) where.userId = params.userId;
  if (params.brandId) where.brandId = params.brandId;

  return prisma.notification.updateMany({
    where,
    data: { read: true, readAt: new Date() },
  });
}

export async function getUnreadCount(params: {
  userId?: string;
  brandId?: string;
}) {
  const where: any = {
    read: false,
  };
  if (params.userId) where.userId = params.userId;
  if (params.brandId) where.brandId = params.brandId;

  return prisma.notification.count({
    where,
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
