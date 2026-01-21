Sprint14.md – Backend Implementation

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
   │ │ ├── audit/
   │ │ │ ├── audit.controller.ts
   │ │ │ ├── audit.routes.ts
   │ │ │ └── audit.service.ts
   │ │ ├── users/
   │ │ │ ├── user.controller.ts
   │ │ │ ├── user.routes.ts
   │ │ │ └── user.service.ts
   │ │ ├── system/
   │ │ │ ├── metrics.controller.ts
   │ │ │ ├── metrics.routes.ts
   │ │ │ └── metrics.service.ts
   │ │ └── reports/
   │ │ ├── reports.controller.ts
   │ │ ├── reports.routes.ts
   │ │ └── reports.service.ts
   │ ├── middleware/
   │ │ └── auth.middleware.ts
   │ └── tests/
   │ ├── auth.test.ts
   │ ├── audit.test.ts
   │ └── users.test.ts
   ├── prisma/
   │ └── schema.prisma
   ├── Dockerfile
   └── docker-compose.yml

2. Dependency Injection
   npm install express cors helmet dotenv jsonwebtoken bcrypt
   npm install prisma @prisma/client
   npm install --save-dev typescript ts-node nodemon jest ts-jest supertest
   npm install chart.js

3. Config
   src/config/env.ts
   import dotenv from "dotenv";
   dotenv.config();

export const ENV = {
PORT: process.env.PORT || "4000",
JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
DATABASE_URL: process.env.DATABASE_URL || "postgres://postgres:postgres@db:5432/app"
};

src/prismaClient.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export default prisma;

prisma/schema.prisma
datasource db {
provider = "postgresql"
url = env("DATABASE_URL")
}

generator client {
provider = "prisma-client-js"
}

model User {
id String @id @default(uuid())
name String
email String @unique
password String
role String
lastLogin DateTime?
createdAt DateTime @default(now())
}

model AuditLog {
id String @id @default(uuid())
userId String
action String
createdAt DateTime @default(now())
user User @relation(fields: [userId], references: [id])
}

model SystemMetric {
id String @id @default(uuid())
type String
value Float
createdAt DateTime @default(now())
}

4. Auth Module
   auth.service.ts
   import prisma from "../../prismaClient";
   import bcrypt from "bcrypt";
   import jwt from "jsonwebtoken";
   import { ENV } from "../../config/env";

export async function register(name: string, email: string, password: string, role: string) {
const hashed = await bcrypt.hash(password, 10);
const user = await prisma.user.create({ data: { name, email, password: hashed, role } });
const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET);
return { token, user };
}

export async function login(email: string, password: string) {
const user = await prisma.user.findUnique({ where: { email } });
if (!user) throw new Error("Invalid credentials");
const match = await bcrypt.compare(password, user.password);
if (!match) throw new Error("Invalid credentials");
const token = jwt.sign({ userId: user.id }, ENV.JWT_SECRET);
return { token, user };
}

auth.controller.ts
import { Request, Response } from "express";
import \* as AuthService from "./auth.service";

export async function registerController(req: Request, res: Response) {
const { name, email, password, role } = req.body;
const result = await AuthService.register(name, email, password, role);
res.json(result);
}

export async function loginController(req: Request, res: Response) {
const { email, password } = req.body;
const result = await AuthService.login(email, password);
res.json(result);
}

5. Audit Module
   audit.service.ts
   import prisma from "../../prismaClient";

export async function getAuditLogs(skip = 0, take = 20) {
return prisma.auditLog.findMany({
skip,
take,
orderBy: { createdAt: "desc" },
include: { user: true }
});
}

export async function logAction(userId: string, action: string) {
return prisma.auditLog.create({ data: { userId, action } });
}

audit.controller.ts
import { Request, Response } from "express";
import \* as AuditService from "./audit.service";

export async function getAuditController(req: Request, res: Response) {
const logs = await AuditService.getAuditLogs();
res.json(logs);
}

6. User Module
   user.service.ts
   import prisma from "../../prismaClient";

export async function getUsers(skip = 0, take = 20) {
return prisma.user.findMany({
skip,
take,
orderBy: { createdAt: "desc" }
});
}

user.controller.ts
import { Request, Response } from "express";
import \* as UserService from "./user.service";

export async function getUsersController(req: Request, res: Response) {
const users = await UserService.getUsers();
res.json(users);
}

7. System Metrics Module
   metrics.service.ts
   import prisma from "../../prismaClient";

export async function getMetrics() {
return prisma.systemMetric.findMany({ orderBy: { createdAt: "desc" } });
}

export async function logMetric(type: string, value: number) {
return prisma.systemMetric.create({ data: { type, value } });
}

metrics.controller.ts
import { Request, Response } from "express";
import \* as MetricsService from "./metrics.service";

export async function getMetricsController(req: Request, res: Response) {
const metrics = await MetricsService.getMetrics();
res.json(metrics);
}

8. App & Server Setup
   app.ts
   import express from "express";
   import cors from "cors";
   import helmet from "helmet";
   import authRoutes from "./modules/auth/auth.routes";
   import auditRoutes from "./modules/audit/audit.routes";
   import userRoutes from "./modules/users/user.routes";
   import metricsRoutes from "./modules/system/metrics.routes";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/audit", auditRoutes);
app.use("/users", userRoutes);
app.use("/metrics", metricsRoutes);

export default app;

server.ts
import app from "./app";
import { ENV } from "./config/env";

app.listen(ENV.PORT, () => console.log(`Server running on port ${ENV.PORT}`));

9. Routes Example
   audit.routes.ts
   import { Router } from "express";
   import { getAuditController } from "./audit.controller";

const router = Router();
router.get("/", getAuditController);

export default router;

auth.routes.ts
import { Router } from "express";
import { loginController, registerController } from "./auth.controller";

const router = Router();
router.post("/login", loginController);
router.post("/register", registerController);

export default router;

10. Tests
    tests/auth.test.ts
    import request from "supertest";
    import app from "../app";

describe("Auth Module", () => {
it("registers a user", async () => {
const res = await request(app).post("/auth/register").send({
name: "Test User",
email: "test@example.com",
password: "Password123!",
role: "Admin"
});
expect(res.body.token).toBeDefined();
expect(res.body.user.email).toBe("test@example.com");
});

it("logs in a user", async () => {
const res = await request(app).post("/auth/login").send({
email: "test@example.com",
password: "Password123!"
});
expect(res.body.token).toBeDefined();
});
});

11. Containerization
    Dockerfile
    FROM node:20
    WORKDIR /app
    COPY . .
    RUN npm install
    RUN npx prisma generate
    CMD ["npm", "run", "start"]

docker-compose.yml
version: "3.9"
services:
api:
build: .
ports: - "4000:4000"
environment:
DATABASE_URL: postgres://postgres:postgres@db:5432/app
JWT_SECRET: dev_secret
depends_on: - db
db:
image: postgres:15
environment:
POSTGRES_PASSWORD: postgres

✅ Best Practices Applied

Modular structure for scalability.

Prisma ORM for type-safe DB interactions.

JWT authentication for security.

Password encryption with bcrypt.

Middleware-ready for future auth and logging.

Pagination & cursor-ready endpoints for audit logs and user lists.

Mockable & testable endpoints with Jest and Supertest.

Containerized for production deployment.
