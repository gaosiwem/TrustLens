import prisma from "../../lib/prisma.js";
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env.js";
import { hashPassword, verifyPassword } from "./auth.utils.js";
import logger from "../../config/logger.js";

export async function register(email: string, password: string, name?: string) {
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, password: passwordHash, name: name ?? null },
    include: { managedBrands: { select: { id: true }, take: 1 } },
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
