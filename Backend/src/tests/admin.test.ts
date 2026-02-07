import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

describe("Admin Management Integration", () => {
  let adminToken: string;
  let adminId: string;

  beforeAll(async () => {
    // Create Admin
    const admin = await prisma.user.create({
      data: {
        email: `admin-mgmt-${Date.now()}@test.com`,
        password: "hashedpassword",
        name: "Admin User",
        role: "ADMIN",
      },
    });
    adminId = admin.id;
    adminToken = jwt.sign({ userId: admin.id, role: "ADMIN" }, ENV.JWT_SECRET);
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: adminId } });
  });

  describe("User Management", () => {
    it("lists users with pagination", async () => {
      const res = await request(app)
        .get("/users?limit=5")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toBeDefined();
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.total).toBeDefined();
    });
  });

  describe("Brand Management", () => {
    it("lists brands with filters", async () => {
      // Create a specific brand to search for
      const name = `SearchableBrand ${Date.now()}`;
      await prisma.brand.create({ data: { name } });

      const res = await request(app)
        .get(`/brands?search=${name}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      const items = res.body.items || res.body.data || [];
      expect(items.some((b: any) => b.name === name.toLowerCase())).toBe(true);
    });
  });

  describe("Complaint Management", () => {
    it("lists complaints for moderation", async () => {
      const res = await request(app)
        .get("/complaints/moderation")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });
  });
});
