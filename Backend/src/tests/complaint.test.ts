import request from "supertest";
import app from "../app.js";

let token: string;

beforeAll(async () => {
  // Mocking login for the sake of the exercise, assuming auth works
  const res = await request(app)
    .post("/auth/login")
    .send({ email: "test@example.com", password: "password" });
  token = res.body.token;
});

it("creates complaint", async () => {
  const res = await request(app)
    .post("/complaints")
    .set("Authorization", `Bearer ${token}`)
    .send({ brandName: "TestBrand", description: "Late delivery" });
  expect(res.body.id).toBeDefined();
});

it("fetches complaints", async () => {
  const res = await request(app)
    .get("/complaints?limit=5")
    .set("Authorization", `Bearer ${token}`);
  expect(res.body.complaints).toBeInstanceOf(Array);
});
