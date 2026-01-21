Sprint3.md – Backend, API, Database, AI Integration

1. FILE ARCHITECTURE
   Backend/
   ├── src/
   │ ├── app.ts
   │ ├── server.ts
   │ ├── prismaClient.ts
   │ ├── config/
   │ │ └── env.ts
   │ ├── modules/
   │ │ ├── auth/ # Existing from Sprint1
   │ │ ├── complaints/
   │ │ │ ├── complaint.controller.ts
   │ │ │ ├── complaint.routes.ts
   │ │ │ └── complaint.service.ts
   │ │ └── brands/
   │ │ ├── brand.controller.ts
   │ │ └── brand.service.ts
   │ ├── middleware/
   │ │ └── auth.middleware.ts
   │ └── tests/
   │ ├── complaint.test.ts
   │ └── brand.test.ts
   ├── prisma/
   │ └── schema.prisma
   ├── uploads/ # Local file storage
   ├── Dockerfile
   └── docker-compose.yml

2. DEPENDENCY INJECTION
   npm install express cors helmet dotenv multer zod
   npm install prisma @prisma/client
   npm install jsonwebtoken bcrypt
   npm install --save-dev typescript ts-node nodemon
   npm install --save-dev jest ts-jest supertest

3. FILE IMPLEMENTATION
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
password String
phoneNumber String?
createdAt DateTime @default(now())
complaints Complaint[]
}

model Brand {
id String @id @default(uuid())
name String @unique
createdAt DateTime @default(now())
complaints Complaint[]
}

model Complaint {
id String @id @default(uuid())
userId String
brandId String?
brandName String
description String
aiSummary String?
status ComplaintStatus @default(PENDING)
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
files ComplaintFile[]
rating ComplaintRating?

user User @relation(fields: [userId], references: [id])
brand Brand? @relation(fields: [brandId], references: [id])
}

model ComplaintFile {
id String @id @default(uuid())
complaintId String
filename String
filetype String
path String
createdAt DateTime @default(now())

complaint Complaint @relation(fields: [complaintId], references: [id])
}

model ComplaintRating {
id String @id @default(uuid())
complaintId String
stars Int @default(0)
comment String?
createdAt DateTime @default(now())

complaint Complaint @relation(fields: [complaintId], references: [id])
}

enum ComplaintStatus {
PENDING
RESOLVED
IN_REVIEW
ESCALATED
}

Backend/src/modules/brands/brand.service.ts
import prisma from "../../prismaClient";

export async function createBrand(name: string) {
return prisma.brand.create({ data: { name } });
}

export async function getBrands() {
return prisma.brand.findMany({ orderBy: { name: "asc" } });
}

Backend/src/modules/brands/brand.controller.ts
import { Request, Response } from "express";
import { createBrand, getBrands } from "./brand.service";

export async function createBrandController(req: Request, res: Response) {
const { name } = req.body;
const brand = await createBrand(name);
res.json(brand);
}

export async function getBrandsController(req: Request, res: Response) {
const brands = await getBrands();
res.json(brands);
}

Backend/src/modules/brands/brand.routes.ts
import { Router } from "express";
import { createBrandController, getBrandsController } from "./brand.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createBrandController);
router.get("/", authenticate, getBrandsController);

export default router;

Backend/src/modules/complaints/complaint.service.ts
import prisma from "../../prismaClient";

export async function createComplaint(data: {
userId: string;
brandName: string;
description: string;
brandId?: string;
}) {
return prisma.complaint.create({ data });
}

export async function fetchComplaints(params: {
cursor?: string;
limit?: number;
status?: string;
}) {
const { cursor, limit = 10, status } = params;
const where = status ? { status } : {};
const complaints = await prisma.complaint.findMany({
where,
take: limit + 1,
skip: cursor ? 1 : 0,
cursor: cursor ? { id: cursor } : undefined,
orderBy: { createdAt: "desc" },
include: { rating: true, files: true },
});
const nextCursor = complaints.length > limit ? complaints.pop()?.id : null;
return { complaints, nextCursor };
}

export async function uploadComplaintFile(complaintId: string, file: {
filename: string;
path: string;
filetype: string;
}) {
return prisma.complaintFile.create({
data: { complaintId, ...file },
});
}

export async function submitComplaintRating(complaintId: string, stars: number, comment?: string) {
return prisma.complaintRating.create({ data: { complaintId, stars, comment } });
}

Backend/src/modules/complaints/complaint.controller.ts
import { Request, Response } from "express";
import {
createComplaint,
fetchComplaints,
uploadComplaintFile,
submitComplaintRating,
} from "./complaint.service";
import multer from "multer";
import path from "path";

const upload = multer({
storage: multer.diskStorage({
destination: "./uploads/",
filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
}),
fileFilter: (_, file, cb) => {
const allowed = ["image/png", "image/jpeg", "application/pdf"];
cb(null, allowed.includes(file.mimetype));
},
limits: { fileSize: 5 _ 1024 _ 1024 } // 5MB
});

export async function createComplaintController(req: Request, res: Response) {
const { brandName, description, brandId } = req.body;
const complaint = await createComplaint({
userId: req.user.userId,
brandName,
description,
brandId,
});
res.json(complaint);
}

export async function getComplaintsController(req: Request, res: Response) {
const { cursor, status, limit } = req.query;
const result = await fetchComplaints({
cursor: cursor as string,
limit: Number(limit) || 10,
status: status as string,
});
res.json(result);
}

export const uploadFileMiddleware = upload.single("file");

export async function uploadComplaintFileController(req: Request, res: Response) {
const { complaintId } = req.body;
if (!req.file) return res.status(400).json({ error: "File required" });
const file = await uploadComplaintFile(complaintId, {
filename: req.file.filename,
path: req.file.path,
filetype: req.file.mimetype
});
res.json(file);
}

export async function submitRatingController(req: Request, res: Response) {
const { complaintId, stars, comment } = req.body;
const rating = await submitComplaintRating(complaintId, stars, comment);
res.json(rating);
}

Backend/src/modules/complaints/complaint.routes.ts
import { Router } from "express";
import {
createComplaintController,
getComplaintsController,
uploadFileMiddleware,
uploadComplaintFileController,
submitRatingController
} from "./complaint.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createComplaintController);
router.get("/", authenticate, getComplaintsController);
router.post("/upload", authenticate, uploadFileMiddleware, uploadComplaintFileController);
router.post("/rating", authenticate, submitRatingController);

export default router;

Backend/src/app.ts
import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import brandRoutes from "./modules/brands/brand.routes";
import complaintRoutes from "./modules/complaints/complaint.routes";

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/brands", brandRoutes);
app.use("/complaints", complaintRoutes);

export default app;

Backend/src/server.ts
import app from "./app";
import { ENV } from "./config/env";

app.listen(ENV.PORT, () => console.log(`Server running on ${ENV.PORT}`));

Backend/src/tests/complaint.test.ts
import request from "supertest";
import app from "../app";

let token: string;

beforeAll(async () => {
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

✅ Notes & Best Practices

Cursor-based pagination for complaints.

Local file storage with Multer; max 5MB per file, images and PDFs.

Complaint rating + optional comment.

AI placeholder stored in aiSummary.

Complaint status as ENUM.

JWT authentication for all endpoints.

Tests included for complaint creation and fetching
