import { prisma } from "../lib/prisma.js";

export async function ensureBrandAlertPrefs(brandId: string) {
  const existing = await prisma.brandAlertPreference.findUnique({
    where: { brandId },
  });
  if (existing) return existing;

  return prisma.brandAlertPreference.create({
    data: {
      brandId,
      emailEnabled: true,
      inAppEnabled: true,
      complaintCreated: true,
      escalations: true,
      newMessages: true,
      statusChanges: true,
      evidenceAdded: true,
      dailyDigestEnabled: true,
    },
  });
}

export async function getBrandAlertPrefs(brandId: string) {
  return ensureBrandAlertPrefs(brandId);
}

export async function updateBrandAlertPrefs(
  brandId: string,
  patch: Partial<{
    emailEnabled: boolean;
    inAppEnabled: boolean;
    complaintCreated: boolean;
    escalations: boolean;
    newMessages: boolean;
    statusChanges: boolean;
    evidenceAdded: boolean;
    dailyDigestEnabled: boolean;
    digestTimeLocal: string | null;
  }>,
) {
  await ensureBrandAlertPrefs(brandId);
  return prisma.brandAlertPreference.update({
    where: { brandId },
    data: {
      ...patch,
    },
  });
}
