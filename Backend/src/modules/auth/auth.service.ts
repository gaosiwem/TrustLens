import prisma from "../../lib/prisma.js";
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env.js";
import { hashPassword, verifyPassword } from "./auth.utils.js";
import logger from "../../config/logger.js";

import { EmailOutboxService } from "../../services/emailOutbox.service.js";
import { EmailTemplates } from "../../services/email/emailTemplates.js";

export async function register(email: string, password: string, name?: string) {
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, password: passwordHash, name: name ?? null },
    include: { managedBrands: { select: { id: true }, take: 1 } },
  });

  // SEND WELCOME EMAIL
  // TODO: Replace with actual verification token logic when implemented
  const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${user.id}`;
  const welcomeEmail = EmailTemplates.getWelcomeEmail(
    user.name || "User",
    verificationLink,
  );

  await EmailOutboxService.enqueueEmail({
    toEmail: user.email,
    subject: welcomeEmail.subject,
    htmlBody: welcomeEmail.htmlBody,
    textBody: welcomeEmail.textBody,
    attachments: welcomeEmail.attachments,
    brandId: user.managedBrands[0]?.id || "system", // Fallback to 'system' if no brand
  });

  const brandId = user.managedBrands[0]?.id;
  const token = jwt.sign(
    { userId: user.id, role: user.role, brandId },
    ENV.JWT_SECRET,
  );
  logger.info(`User registered successfully: ${email}`, { userId: user.id });
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      brandId,
    },
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    logger.warn(`Failed login attempt (user not found): ${email}`);
    throw new Error("Invalid credentials");
  }
  if (!user.password) {
    logger.warn(`Failed login attempt (no password, likely OAuth): ${email}`);
    throw new Error("Invalid credentials");
  }

  const valid = await verifyPassword(password, user.password);

  if (!valid) {
    logger.warn(`Failed login attempt (invalid password): ${email}`);
    throw new Error("Invalid credentials");
  }

  logger.info(`User logged in successfully: ${email}`, { userId: user.id });

  const managedBrand = await prisma.brand.findFirst({
    where: {
      OR: [
        { managerId: user.id },
        { members: { some: { userId: user.id, isActive: true } } },
      ],
    },
    select: { id: true },
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role, brandId: managedBrand?.id },
    ENV.JWT_SECRET,
  );
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      brandId: managedBrand?.id,
    },
  };
}

export async function googleLogin(email: string, providerId: string) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password: "OAUTH_USER",
      },
    });
  }

  const managedBrand = await prisma.brand.findFirst({
    where: {
      OR: [
        { managerId: user.id },
        { members: { some: { userId: user.id, isActive: true } } },
      ],
    },
    select: { id: true },
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role, brandId: managedBrand?.id },
    ENV.JWT_SECRET,
  );
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      brandId: managedBrand?.id,
    },
  };
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Return success to prevent enumeration
    return { message: "If an account exists, a reset email has been sent." };
  }

  const token = jwt.sign(
    { userId: user.id, type: "password-reset" },
    ENV.JWT_SECRET,
    { expiresIn: "1h" },
  );

  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;

  const emailContent = EmailTemplates.getPasswordResetEmail(resetLink);

  await EmailOutboxService.enqueueEmail({
    toEmail: user.email,
    subject: emailContent.subject,
    htmlBody: emailContent.htmlBody,
    textBody: emailContent.textBody,
    attachments: emailContent.attachments,
    brandId: "system",
  });

  return { message: "If an account exists, a reset email has been sent." };
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;

    if (decoded.type !== "password-reset") {
      throw new Error("Invalid token type");
    }

    const userId = decoded.userId;
    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });

    return { message: "Password updated successfully" };
  } catch (err) {
    throw new Error("Invalid or expired reset token");
  }
}
