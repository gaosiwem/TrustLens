import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

describe("Brand Management Integration", () => {
  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let userId: string;

  beforeAll(async () => {
    // Create Admin
    const admin = await prisma.user.create({
      data: {
        email: `admin-brand-${Date.now()}@test.com`,
        password: "hashedpassword",
        name: "Admin User",
        role: "ADMIN",
      },
    });
    adminId = admin.id;
    adminToken = jwt.sign({ userId: admin.id, role: "ADMIN" }, ENV.JWT_SECRET);

    // Create Regular User
    const user = await prisma.user.create({
      data: {
        email: `user-brand-${Date.now()}@test.com`,
        password: "hashedpassword",
        name: "Regular User",
        role: "USER",
      },
    });
    userId = user.id;
    userToken = jwt.sign({ userId: user.id, role: "USER" }, ENV.JWT_SECRET);
  });

  afterAll(async () => {
    await prisma.brand.deleteMany({
      where: { name: { startsWith: "Test Brand" } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [adminId, userId] } },
    });
  });

  it("admin created brand should be verified by default", async () => {
    const brandName = `Test Brand Admin ${Date.now()}`;
    const res = await request(app)
      .post("/brands")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: brandName });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe(brandName.toLowerCase());
    expect(res.body.isVerified).toBe(true);
  });

  it("user created brand should NOT be verified by default", async () => {
    const brandName = `Test Brand User ${Date.now()}`;
    const res = await request(app)
      .post("/brands")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: brandName });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe(brandName.toLowerCase());
    expect(res.body.isVerified).toBe(false);
  });

  it("admin can toggle verification status", async () => {
    // Create unverified brand first
    const brand = await prisma.brand.create({
      data: { name: `Test Brand Toggle ${Date.now()}`, isVerified: false },
    });

    const res = await request(app)
      .patch(`/brands/${brand.id}/verify`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.isVerified).toBe(true);

    // Toggle back
    const res2 = await request(app)
      .patch(`/brands/${brand.id}/verify`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res2.status).toBe(200);
    expect(res2.body.isVerified).toBe(false);
  });

  it("regular user CANNOT toggle verification status", async () => {
    const brand = await prisma.brand.create({
      data: { name: `Test Brand NoAccess ${Date.now()}`, isVerified: false },
    });

    const res = await request(app)
      .patch(`/brands/${brand.id}/verify`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});
