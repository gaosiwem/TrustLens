Sprint1.md – Backend, API, and Database Implementation
Email: admin@trustlens.com
Password: administrator123!

adminpassword123 (Brands)

johndoe@mtn.com
johndoepassword

resego4gaosiwe@gmail.com
resego41gaosiwe@gmail.com
resego42gaosiwe@gmail.com

1. FILE ARCHITECTURE

Backend only. AI scaffold included.

Backend/
├── src/
│ ├── app.ts
│ ├── server.ts
│ ├── prismaClient.ts
│ ├── config/
│ │ └── env.ts
│ ├── modules/
│ │ ├── auth/
│ │ │ ├── auth.controller.ts
│ │ │ ├── auth.routes.ts
│ │ │ ├── auth.service.ts
│ │ │ └── auth.utils.ts
│ │ ├── users/
│ │ │ ├── user.service.ts
│ │ │ └── user.routes.ts
│ │ ├── complaints/
│ │ │ ├── complaint.controller.ts
│ │ │ ├── complaint.routes.ts
│ │ │ └── complaint.service.ts
│ │ └── oauth/
│ │ └── oauth.service.ts
│ ├── middleware/
│ │ └── auth.middleware.ts
│ └── tests/
│ ├── auth.test.ts
│ ├── user.test.ts
│ └── complaint.test.ts
├── prisma/
│ └── schema.prisma
├── Dockerfile
└── docker-compose.yml

2. DEPENDENCY INJECTION
   npm install express cors helmet dotenv bcrypt jsonwebtoken prisma @prisma/client next-auth
   npm install --save-dev typescript ts-node nodemon jest ts-jest supertest

3. FILE IMPLEMENTATION
   Backend/src/config/env.ts
   import dotenv from "dotenv";
   dotenv.config();

export const ENV = {
PORT: process.env.PORT || "3000",
JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
DATABASE_URL: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/app",
SMTP_URL: process.env.SMTP_URL || "",
};

Backend/src/prismaClient.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export default prisma;

Backend/prisma/schema.prisma
datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

generator client {
provider = "prisma-client-js"
}

model User {
id String @id @default(uuid())
email String @unique
passwordHash String?
phoneNumber String?
displayName String?
emailVerified Boolean @default(false)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
complaints Complaint[]
oauthAccounts OAuthUser[]
}

model OAuthUser {
id String @id @default(uuid())
provider String
providerId String
userId String
user User @relation(fields: [userId], references: [id])
createdAt DateTime @default(now())
}

model Complaint {
id String @id @default(uuid())
title String
description String
brand String
desiredAction String
receiptUrl String?
status String @default("pending")
userId String
user User @relation(fields: [userId], references: [id])
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

Backend/src/modules/auth/auth.utils.ts
import bcrypt from "bcrypt";

export async function hashPassword(password: string) {
return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
return await bcrypt.compare(password, hash);
}

Backend/src/modules/auth/auth.service.ts
import prisma from "../../prismaClient";
import jwt from "jsonwebtoken";
import { ENV } from "../../config/env";
import { hashPassword, verifyPassword } from "./auth.utils";

export async function register(email: string, password: string) {
const passwordHash = await hashPassword(password);
const user = await prisma.user.create({
data: { email, passwordHash }
});

const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET);
return { token };
}

export async function login(email: string, password: string) {
const user = await prisma.user.findUnique({ where: { email } });
if (!user || !user.passwordHash) throw new Error("Invalid credentials");

const valid = await verifyPassword(password, user.passwordHash);
if (!valid) throw new Error("Invalid credentials");

const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET);
return { token };
}

export async function googleLogin(email: string, providerId: string) {
let user = await prisma.user.findUnique({ where: { email } });
if (!user) {
user = await prisma.user.create({ data: { email, emailVerified: true } });
}
await prisma.oAuthUser.upsert({
where: { provider_providerId: { provider: "google", providerId } },
update: {},
create: { provider: "google", providerId, userId: user.id }
});
const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET);
return { token };
}

Backend/src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import \* as authService from "./auth.service";

export async function registerController(req: Request, res: Response) {
try {
const { email, password } = req.body;
const result = await authService.register(email, password);
res.json(result);
} catch (err: any) {
res.status(400).json({ error: err.message });
}
}

export async function loginController(req: Request, res: Response) {
try {
const { email, password } = req.body;
const result = await authService.login(email, password);
res.json(result);
} catch (err: any) {
res.status(400).json({ error: err.message });
}
}

export async function googleLoginController(req: Request, res: Response) {
try {
const { email, providerId } = req.body;
const result = await authService.googleLogin(email, providerId);
res.json(result);
} catch (err: any) {
res.status(400).json({ error: err.message });
}
}

Backend/src/modules/auth/auth.routes.ts
import { Router } from "express";
import { registerController, loginController, googleLoginController } from "./auth.controller";

const router = Router();
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/google", googleLoginController);

export default router;

Backend/src/modules/users/user.service.ts
import prisma from "../../prismaClient";

export async function getUserProfile(userId: string) {
return prisma.user.findUnique({ where: { id: userId } });
}

Backend/src/modules/users/user.routes.ts
import { Router, Request, Response } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { getUserProfile } from "./user.service";

const router = Router();
router.get("/me", authenticate, async (req: Request, res: Response) => {
const profile = await getUserProfile((req.user as any).userId);
res.json(profile);
});

export default router;

Backend/src/modules/complaints/complaint.service.ts
import prisma from "../../prismaClient";

export async function createComplaint(userId: string, data: any) {
return prisma.complaint.create({ data: { ...data, userId } });
}

export async function listComplaints(userId: string) {
return prisma.complaint.findMany({ where: { userId } });
}

Backend/src/modules/complaints/complaint.controller.ts
import { Request, Response } from "express";
import \* as complaintService from "./complaint.service";

export async function createComplaintController(req: Request, res: Response) {
const userId = (req.user as any).userId;
const result = await complaintService.createComplaint(userId, req.body);
res.json(result);
}

export async function listComplaintsController(req: Request, res: Response) {
const userId = (req.user as any).userId;
const result = await complaintService.listComplaints(userId);
res.json(result);
}

Backend/src/modules/complaints/complaint.routes.ts
import { Router } from "express";
import { createComplaintController, listComplaintsController } from "./complaint.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
router.post("/", authenticate, createComplaintController);
router.get("/", authenticate, listComplaintsController);

export default router;

Backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export function authenticate(req: Request, res: Response, next: NextFunction) {
const token = req.headers.authorization?.split(" ")[1];
if (!token) return res.status(401).end();

try {
req.user = jwt.verify(token, ENV.JWT_SECRET);
next();
} catch {
res.status(401).end();
}
}

Backend/src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import complaintRoutes from "./modules/complaints/complaint.routes";

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/complaints", complaintRoutes);

export default app;

Backend/src/server.ts
import app from "./app";
import { ENV } from "./config/env";

app.listen(ENV.PORT, () => console.log(`Server running on port ${ENV.PORT}`));

Backend/src/tests/auth.test.ts
import request from "supertest";
import app from "../app";

it("registers a user", async () => {
const res = await request(app)
.post("/auth/register")
.send({ email: "test@example.com", password: "Test1234" });
expect(res.body.token).toBeDefined();
});

it("logs in a user", async () => {
await request(app).post("/auth/register").send({ email: "login@example.com", password: "Test1234" });
const res = await request(app)
.post("/auth/login")
.send({ email: "login@example.com", password: "Test1234" });
expect(res.body.token).toBeDefined();
});

Backend/src/tests/complaint.test.ts
import request from "supertest";
import app from "../app";

let token: string;

beforeAll(async () => {
const res = await request(app).post("/auth/register").send({ email: "user@example.com", password: "Test1234" });
token = res.body.token;
});

it("creates a complaint", async () => {
const res = await request(app)
.post("/complaints")
.set("Authorization", `Bearer ${token}`)
.send({ title: "Late Delivery", description: "Package was late", brand: "BrandX", desiredAction: "Refund" });
expect(res.body.id).toBeDefined();
});

4. CONTAINERISATION
   Backend/Dockerfile
   FROM node:20
   WORKDIR /app
   COPY package\*.json ./
   RUN npm install
   COPY . .
   RUN npx prisma generate
   CMD ["npm", "run", "start"]

Backend/docker-compose.yml
version: "3.9"
services:
api:
build: .
ports: - "3000:3000"
environment:
DATABASE_URL: postgres://postgres:postgres@db:5432/app
JWT_SECRET: dev_secret
depends_on: - db
db:
image: postgres:15
environment:
POSTGRES_PASSWORD: postgres
POSTGRES_DB: app
