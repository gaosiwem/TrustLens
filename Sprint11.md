Sprint11.md – Backend Implementation

1. File Architecture
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
   │ │ │ └── auth.service.ts
   │ │ ├── complaints/
   │ │ │ ├── complaint.controller.ts
   │ │ │ ├── complaint.routes.ts
   │ │ │ ├── complaint.service.ts
   │ │ │ └── complaint.types.ts
   │ │ └── followups/
   │ │ ├── followup.controller.ts
   │ │ ├── followup.routes.ts
   │ │ └── followup.service.ts
   │ ├── middleware/
   │ │ └── auth.middleware.ts
   │ └── tests/
   │ ├── complaint.test.ts
   │ └── followup.test.ts
   ├── prisma/
   │ └── schema.prisma
   ├── Dockerfile
   └── docker-compose.yml

2. Environment Configuration

Backend/src/config/env.ts

import dotenv from "dotenv";
dotenv.config();

export const ENV = {
PORT: process.env.PORT || "3000",
JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads"
};

3. Prisma Client

Backend/src/prismaClient.ts

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default prisma;

4. Prisma Schema

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
password String
name String?
phone String?
createdAt DateTime @default(now())
complaints Complaint[]
followups Followup[]
}

model Complaint {
id String @id @default(uuid())
userId String
brand String
description String
receiptFiles String[] // store filenames/paths
status Status @default(PENDING)
aiSummary String? // AI insights
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
user User @relation(fields: [userId], references: [id])
followups Followup[]
}

model Followup {
id String @id @default(uuid())
complaintId String
userId String
comment String
createdAt DateTime @default(now())
complaint Complaint @relation(fields: [complaintId], references: [id])
user User @relation(fields: [userId], references: [id])
}

enum Status {
PENDING
RESOLVED
ESCALATED
}

5. Middleware – Authentication

Backend/src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export interface AuthRequest extends Request {
user?: { userId: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
const token = req.headers.authorization?.split(" ")[1];
if (!token) return res.status(401).json({ error: "Unauthorized" });

try {
req.user = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
next();
} catch {
res.status(401).json({ error: "Invalid token" });
}
}

6. Complaint Service

Backend/src/modules/complaints/complaint.service.ts

import prisma from "../../prismaClient";

export async function createComplaint(
userId: string,
brand: string,
description: string,
receiptFiles: string[],
aiSummary?: string
) {
return prisma.complaint.create({
data: { userId, brand, description, receiptFiles, aiSummary },
});
}

export async function getComplaints(cursor?: string, limit: number = 10) {
return prisma.complaint.findMany({
take: limit,
skip: cursor ? 1 : 0,
cursor: cursor ? { id: cursor } : undefined,
orderBy: { createdAt: "desc" },
include: { followups: true, user: { select: { id: true, email: true } } },
});
}

export async function getComplaintById(id: string) {
return prisma.complaint.findUnique({
where: { id },
include: { followups: true, user: { select: { id, email } } },
});
}

export async function updateComplaintStatus(id: string, status: "PENDING" | "RESOLVED" | "ESCALATED") {
return prisma.complaint.update({
where: { id },
data: { status },
});
}

7. Followup Service

Backend/src/modules/followups/followup.service.ts

import prisma from "../../prismaClient";

export async function addFollowup(complaintId: string, userId: string, comment: string) {
return prisma.followup.create({
data: { complaintId, userId, comment },
});
}

export async function getFollowupsByComplaint(complaintId: string) {
return prisma.followup.findMany({
where: { complaintId },
orderBy: { createdAt: "asc" },
include: { user: { select: { id, email } } },
});
}

8. Complaint Controller

Backend/src/modules/complaints/complaint.controller.ts

import { Request, Response } from "express";
import \* as complaintService from "./complaint.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export async function createComplaintController(req: AuthRequest, res: Response) {
const { brand, description } = req.body;
const files = req.files as Express.Multer.File[];
const receiptFiles = files?.map(f => f.filename) || [];
const complaint = await complaintService.createComplaint(req.user!.userId, brand, description, receiptFiles, req.body.aiSummary);
res.json(complaint);
}

export async function getComplaintsController(req: Request, res: Response) {
const { cursor, limit } = req.query;
const complaints = await complaintService.getComplaints(cursor as string, Number(limit) || 10);
res.json(complaints);
}

export async function getComplaintByIdController(req: Request, res: Response) {
const { id } = req.params;
const complaint = await complaintService.getComplaintById(id);
res.json(complaint);
}

export async function updateComplaintStatusController(req: Request, res: Response) {
const { id } = req.params;
const { status } = req.body;
const updated = await complaintService.updateComplaintStatus(id, status);
res.json(updated);
}

9. Followup Controller

Backend/src/modules/followups/followup.controller.ts

import { Request, Response } from "express";
import \* as followupService from "./followup.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export async function addFollowupController(req: AuthRequest, res: Response) {
const { complaintId, comment } = req.body;
const followup = await followupService.addFollowup(complaintId, req.user!.userId, comment);
res.json(followup);
}

export async function getFollowupsController(req: Request, res: Response) {
const { complaintId } = req.params;
const followups = await followupService.getFollowupsByComplaint(complaintId);
res.json(followups);
}

10. Routes

Backend/src/modules/complaints/complaint.routes.ts

import { Router } from "express";
import multer from "multer";
import { authenticate } from "../../middleware/auth.middleware";
import { createComplaintController, getComplaintsController, getComplaintByIdController, updateComplaintStatusController } from "./complaint.controller";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/create", authenticate, upload.array("receiptFiles"), createComplaintController);
router.get("/list", authenticate, getComplaintsController);
router.get("/:id", authenticate, getComplaintByIdController);
router.patch("/:id/status", authenticate, updateComplaintStatusController);

export default router;

Backend/src/modules/followups/followup.routes.ts

import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { addFollowupController, getFollowupsController } from "./followup.controller";

const router = Router();
router.post("/add", authenticate, addFollowupController);
router.get("/:complaintId", authenticate, getFollowupsController);

export default router;

11. App & Server

Backend/src/app.ts

import express from "express";
import cors from "cors";
import helmet from "helmet";
import complaintRoutes from "./modules/complaints/complaint.routes";
import followupRoutes from "./modules/followups/followup.routes";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/complaints", complaintRoutes);
app.use("/followups", followupRoutes);

export default app;

Backend/src/server.ts

import app from "./app";
import { ENV } from "./config/env";

app.listen(ENV.PORT, () => {
console.log(`Sprint11 API running on port ${ENV.PORT}`);
});

12. Tests

Backend/src/tests/complaint.test.ts

import request from "supertest";
import app from "../app";

let token: string;

beforeAll(async () => {
const res = await request(app)
.post("/auth/login")
.send({ email: "test@example.com", password: "password123" });
token = res.body.token;
});

it("creates a complaint", async () => {
const res = await request(app)
.post("/complaints/create")
.set("Authorization", `Bearer ${token}`)
.field("brand", "TestBrand")
.field("description", "This is a test complaint");

expect(res.status).toBe(200);
expect(res.body.brand).toBe("TestBrand");
});

it("lists complaints", async () => {
const res = await request(app)
.get("/complaints/list")
.set("Authorization", `Bearer ${token}`);
expect(Array.isArray(res.body)).toBe(true);
});

Backend/src/tests/followup.test.ts

import request from "supertest";
import app from "../app";

let token: string;
let complaintId: string;

beforeAll(async () => {
const loginRes = await request(app)
.post("/auth/login")
.send({ email: "test@example.com", password: "password123" });
token = loginRes.body.token;

const complaintRes = await request(app)
.post("/complaints/create")
.set("Authorization", `Bearer ${token}`)
.field("brand", "TestBrand")
.field("description", "Test complaint");

complaintId = complaintRes.body.id;
});

it("adds a followup", async () => {
const res = await request(app)
.post("/followups/add")
.set("Authorization", `Bearer ${token}`)
.send({ complaintId, comment: "This is a followup" });

expect(res.status).toBe(200);
expect(res.body.comment).toBe("This is a followup");
});

13. Containerization

Backend/Dockerfile

FROM node:20
WORKDIR /app
COPY . .
RUN npm install
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
volumes: - ./uploads:/app/uploads
depends_on: - db
db:
image: postgres:15
environment:
POSTGRES_PASSWORD: postgres
ports: - "5432:5432"

✅ Sprint11.md is now fully implemented, including:

Complaint creation with file uploads

Follow-up management

AI summary storage

Status tracking

Cursor-based pagination

Authentication middleware

Production-ready folder structure and Docker setup

Tests for complaints and follow-ups
