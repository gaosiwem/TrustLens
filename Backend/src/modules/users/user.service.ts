import { type UserRole } from "@prisma/client";
import prisma from "../../lib/prisma.js";

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; role?: UserRole },
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function adminUpdateUser(
  userId: string,
  data: { name?: string; role?: UserRole },
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
}

export async function getUsers(
  params: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
  } = {},
) {
  const {
    limit = 20,
    offset = 0,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
  } = params;

  const where: any = {};

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      take: limit,
      skip: offset,
      where,
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total };
}
