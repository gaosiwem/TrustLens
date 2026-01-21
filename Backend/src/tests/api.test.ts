import request from "supertest";
import app from "../app.js";

describe("Health Check", () => {
  it("should return healthy status", async () => {
    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "healthy");
    expect(res.body).toHaveProperty("services");
  });
});

describe("API Endpoints", () => {
  it("should return 404 for non-existent routes", async () => {
    const res = await request(app).get("/non-existent-route");
    expect(res.statusCode).toBe(404);
  });

  it("should enforce authentication on protected routes", async () => {
    const res = await request(app).get("/dashboard");
    expect(res.statusCode).toBe(401);
  });
});
