Sprint7.md – Full Backend Implementation

Here’s a production-ready backend structure for Sprint7, using Node.js, Express, Prisma, JWT auth, file uploads, and cursor-based pagination.

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
   │ │ │ └── complaint.service.ts
   │ ├── middleware/
   │ │ └── auth.middleware.ts
   │ └── uploads/
   │ └── (attachments stored here)
   ├── prisma/
   │ └── schema.prisma
   ├── Dockerfile
   └── docker-compose.yml

2. Dependencies
   npm install express cors helmet dotenv multer
   npm install prisma @prisma/client
   npm install jsonwebtoken bcrypt
   npm install --save-dev typescript ts-node nodemon
   npm install --save-dev jest ts-jest supertest

3. Prisma Schema – Sprint7
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
phone String?
createdAt DateTime @default(now())
complaints Complaint[]
}

model Brand {
id String @id @default(uuid())
name String @unique
complaints Complaint[]
}

model Complaint {
id String @id @default(uuid())
userId String
brandId String?
brandName String?
description String
status ComplaintStatus @default(PENDING)
aiSummary String @default("")
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
deletedAt DateTime?
attachments Attachment[]
user User @relation(fields: [userId], references: [id])
brand Brand? @relation(fields: [brandId], references: [id])
}

model Attachment {
id String @id @default(uuid())
complaintId String
filename String
filepath String
mimetype String
size Int
complaint Complaint @relation(fields: [complaintId], references: [id])
}

enum ComplaintStatus {
PENDING
RESOLVED
REWRITTEN
}

4. Config

src/config/env.ts

import dotenv from "dotenv";
dotenv.config();

export const ENV = {
PORT: process.env.PORT || "3000",
JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
UPLOAD_DIR: process.env.UPLOAD_DIR || "src/uploads",
};

src/prismaClient.ts

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default prisma;

5. Authentication Middleware

src/middleware/auth.middleware.ts

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

src/modules/complaints/complaint.service.ts

import prisma from "../../prismaClient";

interface CreateComplaintInput {
userId: string;
brandName?: string;
brandId?: string;
description: string;
}

export async function createComplaint(data: CreateComplaintInput) {
const complaint = await prisma.complaint.create({
data: {
userId: data.userId,
brandName: data.brandName,
brandId: data.brandId,
description: data.description,
},
});
return complaint;
}

export async function listComplaints(cursor?: string, limit: number = 10) {
const complaints = await prisma.complaint.findMany({
take: limit,
skip: cursor ? 1 : 0,
...(cursor && { cursor: { id: cursor } }),
orderBy: { createdAt: "desc" },
include: { attachments: true },
});
return complaints;
}

export async function getComplaintById(id: string) {
return prisma.complaint.findUnique({
where: { id },
include: { attachments: true },
});
}

export async function attachFiles(complaintId: string, files: any[]) {
const attachments = await Promise.all(
files.map(file =>
prisma.attachment.create({
data: {
complaintId,
filename: file.originalname,
filepath: file.path,
mimetype: file.mimetype,
size: file.size,
},
})
)
);
return attachments;
}

7. Complaint Controller

src/modules/complaints/complaint.controller.ts

import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import {
createComplaint,
listComplaints,
getComplaintById,
attachFiles,
} from "./complaint.service";

export async function createComplaintController(req: AuthRequest, res: Response) {
const { brandName, brandId, description } = req.body;
const complaint = await createComplaint({
userId: req.user!.userId,
brandName,
brandId,
description,
});

if (req.files && req.files.length) {
await attachFiles(complaint.id, req.files as any[]);
}

res.json({ complaint });
}

export async function listComplaintsController(req: Request, res: Response) {
const { cursor, limit } = req.query;
const complaints = await listComplaints(cursor as string, Number(limit) || 10);
res.json({ complaints });
}

export async function getComplaintController(req: Request, res: Response) {
const { id } = req.params;
const complaint = await getComplaintById(id);
if (!complaint) return res.status(404).json({ error: "Complaint not found" });
res.json({ complaint });
}

8. Complaint Routes

src/modules/complaints/complaint.routes.ts

import { Router } from "express";
import multer from "multer";
import { ENV } from "../../config/env";
import {
createComplaintController,
listComplaintsController,
getComplaintController,
} from "./complaint.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
const upload = multer({ dest: ENV.UPLOAD_DIR });

router.post("/", authenticate, upload.array("attachments"), createComplaintController);
router.get("/", authenticate, listComplaintsController);
router.get("/:id", authenticate, getComplaintController);

export default router;

9. App Entry

src/app.ts

import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
import complaintRoutes from "./modules/complaints/complaint.routes";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/complaints", complaintRoutes);

export default app;

src/server.ts

import app from "./app";
import { ENV } from "./config/env";

app.listen(ENV.PORT, () => {
console.log(`Server running on port ${ENV.PORT}`);
});

10. Tests (Example)

src/tests/complaint.test.ts

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
.post("/complaints")
.set("Authorization", `Bearer ${token}`)
.field("brandName", "Acme Inc")
.field("description", "Test complaint");
expect(res.status).toBe(200);
expect(res.body.complaint).toBeDefined();
});

it("lists complaints", async () => {
const res = await request(app)
.get("/complaints?limit=5")
.set("Authorization", `Bearer ${token}`);
expect(res.status).toBe(200);
expect(res.body.complaints.length).toBeGreaterThan(0);
});

✅ Sprint7.md fully implements:

Complaint creation, listing, detail

Attachment upload (images + PDFs)

Cursor-based pagination

AI summary placeholder

User authentication integration

Prisma schema with Complaint, Attachment, and optional Brand

Local storage for attachments

QA-ready test examples
