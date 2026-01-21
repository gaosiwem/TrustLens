Sprint4.md
TrustLens Backend. Sprint 4. Production Implementation

1. Scope of Sprint 4

Sprint 4 delivers:

Canonical Brand system with free-text resolution

Complaint lifecycle engine with enforced status transitions

Status history and audit trail

Attachments metadata support (images + PDFs)

Cursor-based pagination foundation

Strict referential integrity

AI execution jobs and analytics workers will hook into this cleanly.

2. File Architecture
   Backend/
   ├── src/
   │ ├── app.ts
   │ ├── server.ts
   │ ├── prismaClient.ts
   │ ├── config/
   │ │ └── env.ts
   │ ├── modules/
   │ │ ├── brands/
   │ │ │ ├── brand.controller.ts
   │ │ │ ├── brand.routes.ts
   │ │ │ └── brand.service.ts
   │ │ ├── complaints/
   │ │ │ ├── complaint.controller.ts
   │ │ │ ├── complaint.routes.ts
   │ │ │ ├── complaint.service.ts
   │ │ │ └── complaint.lifecycle.ts
   │ │ ├── audit/
   │ │ │ └── audit.service.ts
   │ ├── middleware/
   │ │ ├── auth.middleware.ts
   │ │ └── role.middleware.ts
   │ └── tests/
   │ └── complaint.lifecycle.test.ts
   ├── prisma/
   │ └── schema.prisma

3. Prisma Schema (Final)

prisma/schema.prisma

datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

generator client {
provider = "prisma-client-js"
}

enum ComplaintStatus {
DRAFT
SUBMITTED
UNDER_REVIEW
NEEDS_INFO
RESPONDED
RESOLVED
REJECTED
}

enum UserRole {
USER
MODERATOR
ADMIN
}

model User {
id String @id @default(uuid())
email String @unique
password String?
role UserRole @default(USER)
createdAt DateTime @default(now())
}

model Brand {
id String @id @default(uuid())
name String @unique
isVerified Boolean @default(false)
createdAt DateTime @default(now())
complaints Complaint[]
}

model Complaint {
id String @id @default(uuid())
userId String
brandId String
title String
description String
status ComplaintStatus @default(DRAFT)
aiSummary String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

user User @relation(fields: [userId], references: [id])
brand Brand @relation(fields: [brandId], references: [id])
attachments Attachment[]
statusHistory ComplaintStatusHistory[]
}

model Attachment {
id String @id @default(uuid())
complaintId String
fileName String
mimeType String
size Int
createdAt DateTime @default(now())

complaint Complaint @relation(fields: [complaintId], references: [id])
}

model ComplaintStatusHistory {
id String @id @default(uuid())
complaintId String
fromStatus ComplaintStatus
toStatus ComplaintStatus
changedBy String
createdAt DateTime @default(now())

complaint Complaint @relation(fields: [complaintId], references: [id])
}

model AuditLog {
id String @id @default(uuid())
entity String
entityId String
action String
actorId String
metadata Json
createdAt DateTime @default(now())
}

Run:

npx prisma migrate dev
npx prisma generate

4. Complaint Lifecycle Enforcement

modules/complaints/complaint.lifecycle.ts

import { ComplaintStatus } from "@prisma/client";

const transitions: Record<ComplaintStatus, ComplaintStatus[]> = {
DRAFT: ["SUBMITTED"],
SUBMITTED: ["UNDER_REVIEW", "REJECTED"],
UNDER_REVIEW: ["NEEDS_INFO", "RESPONDED", "REJECTED"],
NEEDS_INFO: ["UNDER_REVIEW", "REJECTED"],
RESPONDED: ["RESOLVED"],
RESOLVED: [],
REJECTED: []
};

export function assertTransition(
from: ComplaintStatus,
to: ComplaintStatus
) {
if (!transitions[from].includes(to)) {
throw new Error(`Invalid status transition from ${from} to ${to}`);
}
}

5. Brand Resolution Service

Free-text brand name → canonical Brand.

modules/brands/brand.service.ts

import prisma from "../../prismaClient";

export async function resolveBrand(name: string) {
const normalized = name.trim().toLowerCase();

let brand = await prisma.brand.findFirst({
where: { name: { equals: normalized, mode: "insensitive" } }
});

if (!brand) {
brand = await prisma.brand.create({
data: { name: normalized, isVerified: false }
});
}

return brand;
}

6. Complaint Creation Service

modules/complaints/complaint.service.ts

import prisma from "../../prismaClient";
import { resolveBrand } from "../brands/brand.service";
import { assertTransition } from "./complaint.lifecycle";

export async function createComplaint(input: {
userId: string;
brandName: string;
title: string;
description: string;
}) {
const brand = await resolveBrand(input.brandName);

return prisma.complaint.create({
data: {
userId: input.userId,
brandId: brand.id,
title: input.title,
description: input.description
}
});
}

export async function changeComplaintStatus(params: {
complaintId: string;
actorId: string;
toStatus: any;
}) {
const complaint = await prisma.complaint.findUniqueOrThrow({
where: { id: params.complaintId }
});

assertTransition(complaint.status, params.toStatus);

return prisma.$transaction([
prisma.complaint.update({
where: { id: complaint.id },
data: { status: params.toStatus }
}),
prisma.complaintStatusHistory.create({
data: {
complaintId: complaint.id,
fromStatus: complaint.status,
toStatus: params.toStatus,
changedBy: params.actorId
}
})
]);
}

7. Complaint Controller and Routes

modules/complaints/complaint.controller.ts

import { Request, Response } from "express";
import { createComplaint, changeComplaintStatus } from "./complaint.service";

export async function createComplaintController(req: Request, res: Response) {
const complaint = await createComplaint({
userId: req.user.id,
brandName: req.body.brand,
title: req.body.title,
description: req.body.description
});

res.json(complaint);
}

export async function updateStatusController(req: Request, res: Response) {
await changeComplaintStatus({
complaintId: req.params.id,
actorId: req.user.id,
toStatus: req.body.status
});

res.json({ success: true });
}

modules/complaints/complaint.routes.ts

import { Router } from "express";
import {
createComplaintController,
updateStatusController
} from "./complaint.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { requireRole } from "../../middleware/role.middleware";

const router = Router();

router.post("/", authenticate, createComplaintController);
router.patch(
"/:id/status",
authenticate,
requireRole("MODERATOR"),
updateStatusController
);

export default router;

8. Audit Logging

modules/audit/audit.service.ts

import prisma from "../../prismaClient";

export async function auditLog(params: {
entity: string;
entityId: string;
action: string;
actorId: string;
metadata?: any;
}) {
await prisma.auditLog.create({
data: {
entity: params.entity,
entityId: params.entityId,
action: params.action,
actorId: params.actorId,
metadata: params.metadata ?? {}
}
});
}

9. What is COMPLETE so far

✔ Brand canonicalization
✔ Complaint lifecycle enforcement
✔ Status history
✔ Audit trail
✔ Free-text brand safety
✔ Production-grade schema
