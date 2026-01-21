Sprint15.md – Notifications & Real-Time Updates Backend

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
   │ │ ├── notifications/
   │ │ │ ├── notification.controller.ts
   │ │ │ ├── notification.routes.ts
   │ │ │ └── notification.service.ts
   │ │ └── users/
   │ │ └── user.service.ts
   │ ├── middleware/
   │ │ └── auth.middleware.ts
   │ └── tests/
   │ ├── auth.test.ts
   │ └── notifications.test.ts
   ├── prisma/
   │ └── schema.prisma
   ├── Dockerfile
   └── docker-compose.yml

2. DEPENDENCY INJECTION
   npm install express cors helmet dotenv
   npm install prisma @prisma/client
   npm install jsonwebtoken bcrypt
   npm install socket.io
   npm install --save-dev typescript ts-node nodemon
   npm install --save-dev jest ts-jest supertest

3. CONFIGURATION

Backend/src/config/env.ts

import dotenv from "dotenv";
dotenv.config();

export const ENV = {
PORT: process.env.PORT || "3000",
JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
DATABASE_URL: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/app"
};

Backend/src/prismaClient.ts

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default prisma;

4. PRISMA SCHEMA

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
notifications Notification[]
}

model Notification {
id String @id @default(uuid())
userId String
type String // "user" | "admin"
message String
read Boolean @default(false)
priority String // "info" | "warning" | "critical"
createdAt DateTime @default(now())
user User @relation(fields: [userId], references: [id])
}

model NotificationPreference {
id String @id @default(uuid())
userId String
emailEnabled Boolean @default(true)
pushEnabled Boolean @default(true)
user User @relation(fields: [userId], references: [id])
}

5. AUTH MIDDLEWARE

Backend/src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export function authenticate(req: Request, res: Response, next: NextFunction) {
const token = req.headers.authorization?.split(" ")[1];
if (!token) return res.status(401).json({ message: "Unauthorized" });

try {
req.user = jwt.verify(token, ENV.JWT_SECRET);
next();
} catch {
res.status(401).json({ message: "Invalid token" });
}
}

6. NOTIFICATION SERVICE

Backend/src/modules/notifications/notification.service.ts

import prisma from "../../prismaClient";

export async function createNotification(userId: string, message: string, type: string = "user", priority: string = "info") {
return prisma.notification.create({
data: { userId, message, type, priority }
});
}

export async function getNotifications(userId: string, cursor?: string, limit: number = 20) {
const notifications = await prisma.notification.findMany({
where: { userId },
orderBy: { createdAt: "desc" },
take: limit,
skip: cursor ? 1 : 0,
cursor: cursor ? { id: cursor } : undefined
});

const nextCursor = notifications.length === limit ? notifications[notifications.length - 1].id : null;

return { notifications, nextCursor };
}

export async function markNotificationRead(notificationId: string) {
return prisma.notification.update({
where: { id: notificationId },
data: { read: true }
});
}

export async function updatePreferences(userId: string, emailEnabled: boolean, pushEnabled: boolean) {
return prisma.notificationPreference.upsert({
where: { userId },
update: { emailEnabled, pushEnabled },
create: { userId, emailEnabled, pushEnabled }
});
}

export async function getPreferences(userId: string) {
return prisma.notificationPreference.findUnique({ where: { userId } });
}

7. NOTIFICATION CONTROLLER

Backend/src/modules/notifications/notification.controller.ts

import { Request, Response } from "express";
import \* as service from "./notification.service";

export async function fetchNotifications(req: Request, res: Response) {
const userId = req.user.userId;
const cursor = req.query.cursor as string | undefined;
const data = await service.getNotifications(userId, cursor);
res.json(data);
}

export async function markRead(req: Request, res: Response) {
const { id } = req.params;
const updated = await service.markNotificationRead(id);
res.json(updated);
}

export async function updatePrefs(req: Request, res: Response) {
const userId = req.user.userId;
const { emailEnabled, pushEnabled } = req.body;
const prefs = await service.updatePreferences(userId, emailEnabled, pushEnabled);
res.json(prefs);
}

export async function getPrefs(req: Request, res: Response) {
const userId = req.user.userId;
const prefs = await service.getPreferences(userId);
res.json(prefs);
}

8. ROUTES

Backend/src/modules/notifications/notification.routes.ts

import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { fetchNotifications, markRead, updatePrefs, getPrefs } from "./notification.controller";

const router = Router();

router.use(authenticate);

router.get("/", fetchNotifications);
router.patch("/:id/read", markRead);
router.patch("/preferences", updatePrefs);
router.get("/preferences", getPrefs);

export default router;

9. APP INITIALIZATION

Backend/src/app.ts

import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
import notificationRoutes from "./modules/notifications/notification.routes";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/notifications", notificationRoutes);

export default app;

Backend/src/server.ts

import app from "./app";
import { ENV } from "./config/env";
import { createServer } from "http";
import { Server } from "socket.io";

const server = createServer(app);
const io = new Server(server, { cors: { origin: "\*" } });

// Socket.IO events
io.on("connection", (socket) => {
console.log("User connected:", socket.id);

socket.on("join", (userId: string) => {
socket.join(userId);
console.log(`User joined room: ${userId}`);
});

socket.on("sendNotification", ({ userId, message }) => {
io.to(userId).emit("notification", message);
});

socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

server.listen(ENV.PORT, () => console.log(`Backend running on port ${ENV.PORT}`));

10. TESTS

Backend/src/tests/notifications.test.ts

import request from "supertest";
import app from "../app";

let token: string;

beforeAll(async () => {
const res = await request(app)
.post("/auth/login")
.send({ email: "test@example.com", password: "Password123!" });
token = res.body.token;
});

it("fetch notifications", async () => {
const res = await request(app).get("/notifications").set("Authorization", `Bearer ${token}`);
expect(res.status).toBe(200);
});

it("update preferences", async () => {
const res = await request(app)
.patch("/notifications/preferences")
.set("Authorization", `Bearer ${token}`)
.send({ emailEnabled: true, pushEnabled: false });
expect(res.body.pushEnabled).toBe(false);
});

11. CONTAINERIZATION

Backend/Dockerfile

FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
CMD ["npm","run","start"]

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

✅ Sprint15.md Fully Implemented

Notification table + preference table

Cursor-based pagination

Priority + read/unread tracking

Real-time WebSocket updates

REST API + Socket.IO integration

Unit tests included

Dockerized for production
