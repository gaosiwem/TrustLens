import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import prisma from "../prismaClient.js";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

describe("Brand Claim Integration", () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;

  beforeAll(async () => {
    // Create Admin
    const admin = await prisma.user.create({
      data: {
        email: `admin-claim-${Date.now()}@test.com`,
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
        email: `user-claim-${Date.now()}@test.com`,
        password: "hashedpassword",
        name: "Claim User",
        role: "USER",
      },
    });
    userId = user.id;
    // Note: The payload must have userId to match the middleware and the fix
    userToken = jwt.sign({ userId: user.id, role: "USER" }, ENV.JWT_SECRET);
  });

  afterAll(async () => {
    await prisma.brandClaim.deleteMany({
      where: { userId: userId },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [userId, adminId] } },
    });
  });

  it("should successfully submit a brand claim", async () => {
    const res = await request(app)
      .post("/brands/claim")
      .set("Authorization", `Bearer ${userToken}`)
      .field("brandName", "Test Brand Claim")
      .field("email", "claim@corporate-domain.com"); // Using corporate domain

    if (res.status !== 200) {
      console.error("Test failed with status:", res.status);
      console.error("Error body:", JSON.stringify(res.body, null, 2));
    }

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.aiScore).toBeDefined();

    // Verify in database
    const claim = await prisma.brandClaim.findFirst({
      where: { userId: userId },
    });
    expect(claim).toBeDefined();
    expect(claim?.brandName).toBe("Test Brand Claim");
    expect(claim?.email).toBe("claim@corporate-domain.com");
  }, 30000); // 30s timeout for AI call

  it("should fail if personal email is used", async () => {
    const res = await request(app)
      .post("/brands/claim")
      .set("Authorization", `Bearer ${userToken}`)
      .field("brandName", "Personal Email Test")
      .field("email", "test@gmail.com");

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("corporate email");
  });

  it("admin should be able to approve a brand claim and link user", async () => {
    // Create a manual claim to approve
    const claim = await prisma.brandClaim.create({
      data: {
        userId: userId,
        brandName: "ApproveAndLinkBrand",
        email: "approve@corp.com",
        aiScore: 90,
        status: "PENDING",
      },
    });

    const res = await request(app)
      .patch(`/admin/brand-claims/${claim.id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "APPROVED" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("APPROVED");

    // Verify brand is now verified and linked to the user
    const brand = await prisma.brand.findFirst({
      where: { name: { equals: "ApproveAndLinkBrand", mode: "insensitive" } },
    });
    expect(brand?.isVerified).toBe(true);
    expect((brand as any).managerId).toBe(userId);

    // Verify user role is promoted to BRAND
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    expect(updatedUser?.role).toBe("BRAND");
  });

  it("should fail if brandName is missing", async () => {
    const res = await request(app)
      .post("/brands/claim")
      .set("Authorization", `Bearer ${userToken}`)
      .field("email", "claim@testbrand.com");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing required fields");
  });

  it("should fail if invalid file type is uploaded", async () => {
    const res = await request(app)
      .post("/brands/claim")
      .set("Authorization", `Bearer ${userToken}`)
      .field("brandName", "Invalid File Test")
      .field("email", "claim@testbrand.com")
      .attach("files", Buffer.from("dummy data"), "test.gif"); // .gif is not allowed

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid file type");
  });
});
