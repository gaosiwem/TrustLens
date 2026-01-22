import speakeasy from "speakeasy";
import QRCode from "qrcode";
import prisma from "../../lib/prisma.js";

export async function generateMFASecret(userId: string, email: string) {
  const secret = speakeasy.generateSecret({
    name: `TrustLens (${email})`,
    length: 32,
  });

  // Store the secret
  await prisma.mFA.upsert({
    where: { userId },
    create: {
      userId,
      secret: secret.base32,
      enabled: false,
    },
    update: {
      secret: secret.base32,
    },
  });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "");

  return {
    secret: secret.base32,
    qrCode: qrCodeUrl,
  };
}

export async function verifyMFAToken(
  userId: string,
  token: string,
): Promise<boolean> {
  const mfa = await prisma.mFA.findUnique({
    where: { userId },
  });

  if (!mfa || !mfa.enabled) {
    return false;
  }

  return speakeasy.totp.verify({
    secret: mfa.secret,
    encoding: "base32",
    token,
    window: 2, // Allow 2 time steps before/after for clock drift
  });
}

export async function enableMFA(
  userId: string,
  verificationToken: string,
): Promise<boolean> {
  const mfa = await prisma.mFA.findUnique({
    where: { userId },
  });

  if (!mfa) {
    throw new Error("MFA not initialized");
  }

  // Verify the token before enabling
  const isValid = speakeasy.totp.verify({
    secret: mfa.secret,
    encoding: "base32",
    token: verificationToken,
    window: 2,
  });

  if (!isValid) {
    throw new Error("Invalid verification token");
  }

  await prisma.mFA.update({
    where: { userId },
    data: { enabled: true },
  });

  return true;
}

export async function disableMFA(userId: string): Promise<void> {
  await prisma.mFA.update({
    where: { userId },
    data: { enabled: false },
  });
}
