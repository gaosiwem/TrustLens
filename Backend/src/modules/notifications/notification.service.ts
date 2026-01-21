import prisma from "../../prismaClient.js";

export async function createNotification(params: {
  userId: string;
  type: string;
  message: string;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      message: params.message,
    },
  });
}

export async function getNotifications(
  userId: string,
  cursor?: string,
  limit = 10
) {
  return prisma.notification.findMany({
    where: { userId },
    take: limit,
    skip: cursor ? 1 : 0,
    ...(cursor && { cursor: { id: cursor } }),
    orderBy: { createdAt: "desc" },
  });
}

export async function markNotificationRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

export async function getNotificationPreferences(userId: string) {
  let prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  // Create default preferences if they don't exist
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
  pushEnabled: boolean
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
