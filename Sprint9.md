Sprint9.md – Backend Implementation

1. FILE ARCHITECTURE
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
   │ │ ├── dashboard/
   │ │ │ ├── dashboard.controller.ts
   │ │ │ ├── dashboard.routes.ts
   │ │ │ └── dashboard.service.ts
   │ ├── middleware/
   │ │ └── auth.middleware.ts
   │ └── tests/
   │ ├── dashboard.test.ts
   │ └── complaint.test.ts
   ├── prisma/
   │ └── schema.prisma
   ├── Dockerfile
   └── docker-compose.yml

2. DEPENDENCY INSTALLATION
   npm install express cors helmet dotenv bcrypt jsonwebtoken prisma @prisma/client
   npm install --save-dev typescript ts-node nodemon jest ts-jest supertest

3. FILE IMPLEMENTATION
   Backend/src/config/env.ts
   import dotenv from "dotenv";
   dotenv.config();

export const ENV = {
PORT: process.env.PORT || "3000",
JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
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
password String
createdAt DateTime @default(now())
complaints Complaint[]
}

model Complaint {
id String @id @default(uuid())
userId String
brand String
type String
status String @default("Pending") // Pending, Resolved, Needs Info
receiptUrl String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model DashboardStat {
id String @id @default(uuid())
metric String
value Int
createdAt DateTime @default(now())
}

4. AUTH MODULE
   auth.service.ts
   import prisma from "../../prismaClient";
   import bcrypt from "bcrypt";
   import jwt from "jsonwebtoken";
   import { ENV } from "../../config/env";

export async function register(email: string, password: string) {
const hashedPassword = await bcrypt.hash(password, 10);
const user = await prisma.user.create({ data: { email, password: hashedPassword } });
const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET);
return { token, user };
}

export async function login(email: string, password: string) {
const user = await prisma.user.findUnique({ where: { email } });
if (!user) throw new Error("Invalid credentials");
const valid = await bcrypt.compare(password, user.password);
if (!valid) throw new Error("Invalid credentials");
const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET);
return { token, user };
}

auth.controller.ts
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

auth.routes.ts
import { Router } from "express";
import { loginController, registerController } from "./auth.controller";

const router = Router();
router.post("/register", registerController);
router.post("/login", loginController);

export default router;

5. COMPLAINT MODULE
   complaint.service.ts
   import prisma from "../../prismaClient";

export async function createComplaint(data: any) {
return prisma.complaint.create({ data });
}

export async function listComplaints(userId: string, cursor?: string, take: number = 10) {
return prisma.complaint.findMany({
where: { userId },
orderBy: { createdAt: "desc" },
take,
...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
});
}

complaint.controller.ts
import { Request, Response } from "express";
import \* as complaintService from "./complaint.service";

export async function createComplaintController(req: Request, res: Response) {
const userId = req.user.userId;
const result = await complaintService.createComplaint({ ...req.body, userId });
res.json(result);
}

export async function listComplaintsController(req: Request, res: Response) {
const userId = req.user.userId;
const { cursor, take } = req.query;
const result = await complaintService.listComplaints(userId, cursor as string, Number(take));
res.json(result);
}

complaint.routes.ts
import { Router } from "express";
import { createComplaintController, listComplaintsController } from "./complaint.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
router.post("/", authenticate, createComplaintController);
router.get("/", authenticate, listComplaintsController);

export default router;

6. DASHBOARD MODULE
   dashboard.service.ts
   import prisma from "../../prismaClient";

export async function getDashboardMetrics(userId: string) {
const totalComplaints = await prisma.complaint.count({ where: { userId } });
const resolved = await prisma.complaint.count({ where: { userId, status: "Resolved" } });
const pending = await prisma.complaint.count({ where: { userId, status: "Pending" } });
const needsInfo = await prisma.complaint.count({ where: { userId, status: "Needs Info" } });

return { totalComplaints, resolved, pending, needsInfo };
}

export async function getAIInsights(userId: string) {
// Placeholder: static mock data
return {
topIssue: "Delivery delays in Sandton",
resolutionSuggestion: "Contact affected users within 24h",
};
}

dashboard.controller.ts
import { Request, Response } from "express";
import \* as dashboardService from "./dashboard.service";

export async function dashboardController(req: Request, res: Response) {
const userId = req.user.userId;
const metrics = await dashboardService.getDashboardMetrics(userId);
const insights = await dashboardService.getAIInsights(userId);
res.json({ metrics, insights });
}

dashboard.routes.ts
import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
router.get("/", authenticate, dashboardController);

export default router;

7. MIDDLEWARE
   auth.middleware.ts
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

8. APP & SERVER
   app.ts
   import express from "express";
   import authRoutes from "./modules/auth/auth.routes";
   import complaintRoutes from "./modules/complaints/complaint.routes";
   import dashboardRoutes from "./modules/dashboard/dashboard.routes";

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/complaints", complaintRoutes);
app.use("/dashboard", dashboardRoutes);

export default app;

server.ts
import app from "./app";
import { ENV } from "./config/env";

app.listen(ENV.PORT, () => console.log(`Server running on port ${ENV.PORT}`));

9. CONTAINERIZATION

Dockerfile

FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
CMD ["npm","run","start"]

docker-compose.yml

version: "3.9"
services:
api:
build: .
ports: - "3000:3000"
depends_on: - db
environment:
DATABASE_URL: postgres://postgres:postgres@db:5432/app
JWT_SECRET: dev_secret
db:
image: postgres:15
environment:
POSTGRES_PASSWORD: postgres

10. TESTING

dashboard.test.ts

import request from "supertest";
import app from "../app";

let token: string;

beforeAll(async () => {
const res = await request(app).post("/auth/register").send({ email: "test@test.com", password: "Password123" });
token = res.body.token;
});

it("fetches dashboard metrics and insights", async () => {
const res = await request(app)
.get("/dashboard")
.set("Authorization", `Bearer ${token}`);
expect(res.status).toBe(200);
expect(res.body.metrics.totalComplaints).toBeDefined();
expect(res.body.insights.topIssue).toBeDefined();
});

✅ Production Notes / Best Practices

Authentication: JWT-based, password stored hashed with bcrypt.

Pagination: Cursor-based for complaints, scalable.

AI Insights: Mocked for now, plug OpenAI or AI engine later.

Dark/Light Mode: Handled in UI.

Error Handling: Return 400 on validation errors, 401 for auth errors.

Containerized: Docker & docker-compose ready for staging/production.

Modular Structure: Each module (auth, complaints, dashboard) fully separated.

Testing: Basic unit/integration test included, extend coverage in future sprints.
