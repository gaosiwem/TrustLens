import request from "supertest";
import app from "../app.js";

describe("Auth Module", () => {
  describe("POST /auth/register", () => {
    it("should register a new user with valid credentials", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({
          email: `test${Date.now()}@example.com`,
          password: "StrongPassword123!",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
    });

    it("should reject weak passwords", async () => {
      const res = await request(app).post("/auth/register").send({
        email: "test@example.com",
        password: "weak",
      });

      expect(res.statusCode).toBe(400);
    });

    it("should reject duplicate email", async () => {
      const email = `duplicate${Date.now()}@example.com`;

      // First registration
      await request(app).post("/auth/register").send({
        email,
        password: "StrongPassword123!",
      });

      // Duplicate registration
      const res = await request(app).post("/auth/register").send({
        email,
        password: "StrongPassword123!",
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    const testUser = {
      email: `logintest${Date.now()}@example.com`,
      password: "StrongPassword123!",
    };

    beforeAll(async () => {
      // Create test user
      await request(app).post("/auth/register").send(testUser);
    });

    it("should login with valid credentials", async () => {
      const res = await request(app).post("/auth/login").send(testUser);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("should reject invalid password", async () => {
      const res = await request(app).post("/auth/login").send({
        email: testUser.email,
        password: "WrongPassword123!",
      });

      expect(res.statusCode).toBe(401);
    });

    it("should reject non-existent user", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: "AnyPassword123!",
      });

      expect(res.statusCode).toBe(401);
    });
  });
});
