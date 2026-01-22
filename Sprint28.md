1. Database. Prisma schema updates

Add these to prisma/schema.prisma.

enum NotificationType {
COMPLAINT_CREATED
COMPLAINT_ESCALATED
NEW_CONSUMER_MESSAGE
STATUS_CHANGED
EVIDENCE_ADDED
}

enum DeliveryChannel {
IN_APP
EMAIL
}

model BrandAlertPreference {
id String @id @default(uuid())
brandId String @unique
emailEnabled Boolean @default(true)
inAppEnabled Boolean @default(true)

complaintCreated Boolean @default(true)
escalations Boolean @default(true)
newMessages Boolean @default(true)
statusChanges Boolean @default(false)
evidenceAdded Boolean @default(false)

dailyDigestEnabled Boolean @default(false)
digestTimeLocal String? // "08:00"

createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model Notification {
id String @id @default(uuid())
brandId String @index
userId String? @index // brand team member recipient. null = brand-wide
type NotificationType
title String
body String
link String?
metadata Json?
isRead Boolean @default(false)
createdAt DateTime @default(now())
readAt DateTime?

@@index([brandId, isRead, createdAt])
}

model EmailOutbox {
id String @id @default(uuid())
brandId String @index
toEmail String
subject String
htmlBody String
textBody String?
status String @default("PENDING") // PENDING | SENT | FAILED
attempts Int @default(0)
lastError String?
createdAt DateTime @default(now())
sentAt DateTime?
}

Run:

npx prisma migrate dev -n sprint_email_alerts_notifications

2. Backend. Notification and Email services
   2.1 Prisma client import (use your existing one)

Assume src/lib/prisma.ts exists:

import { PrismaClient } from "@prisma/client"
export const prisma = new PrismaClient()

2.2 Brand alert preference bootstrap

src/services/brandAlertPreference.service.ts

import { prisma } from "@/src/lib/prisma"

export async function ensureBrandAlertPrefs(brandId: string) {
const existing = await prisma.brandAlertPreference.findUnique({ where: { brandId } })
if (existing) return existing

return prisma.brandAlertPreference.create({
data: {
brandId,
emailEnabled: true,
inAppEnabled: true,
complaintCreated: true,
escalations: true,
newMessages: true,
statusChanges: false,
evidenceAdded: false,
dailyDigestEnabled: false
}
})
}

export async function getBrandAlertPrefs(brandId: string) {
return ensureBrandAlertPrefs(brandId)
}

export async function updateBrandAlertPrefs(brandId: string, patch: Partial<{
emailEnabled: boolean
inAppEnabled: boolean
complaintCreated: boolean
escalations: boolean
newMessages: boolean
statusChanges: boolean
evidenceAdded: boolean
dailyDigestEnabled: boolean
digestTimeLocal: string | null
}>) {
await ensureBrandAlertPrefs(brandId)
return prisma.brandAlertPreference.update({
where: { brandId },
data: {
...patch
}
})
}

2.3 Notification creation service

src/services/notification.service.ts

import { prisma } from "@/src/lib/prisma"
import { ensureBrandAlertPrefs } from "@/src/services/brandAlertPreference.service"
import { enqueueEmail } from "@/src/services/emailOutbox.service"

type NotifyArgs = {
brandId: string
userId?: string | null
type: "COMPLAINT_CREATED" | "COMPLAINT_ESCALATED" | "NEW_CONSUMER_MESSAGE" | "STATUS_CHANGED" | "EVIDENCE_ADDED"
title: string
body: string
link?: string
metadata?: Record<string, any>
toEmails?: string[] // brand recipients. populate from brand members in your auth model
}

export async function notifyBrand(args: NotifyArgs) {
const prefs = await ensureBrandAlertPrefs(args.brandId)

const shouldInApp =
prefs.inAppEnabled &&
(
(args.type === "COMPLAINT_CREATED" && prefs.complaintCreated) ||
(args.type === "COMPLAINT_ESCALATED" && prefs.escalations) ||
(args.type === "NEW_CONSUMER_MESSAGE" && prefs.newMessages) ||
(args.type === "STATUS_CHANGED" && prefs.statusChanges) ||
(args.type === "EVIDENCE_ADDED" && prefs.evidenceAdded)
)

const shouldEmail =
prefs.emailEnabled &&
(
(args.type === "COMPLAINT_CREATED" && prefs.complaintCreated) ||
(args.type === "COMPLAINT_ESCALATED" && prefs.escalations) ||
(args.type === "NEW_CONSUMER_MESSAGE" && prefs.newMessages) ||
(args.type === "STATUS_CHANGED" && prefs.statusChanges) ||
(args.type === "EVIDENCE_ADDED" && prefs.evidenceAdded)
)

if (shouldInApp) {
await prisma.notification.create({
data: {
brandId: args.brandId,
userId: args.userId ?? null,
type: args.type,
title: args.title,
body: args.body,
link: args.link ?? null,
metadata: args.metadata ?? undefined
}
})
}

if (shouldEmail && args.toEmails?.length) {
const subject = `[TrustLens] ${args.title}`
const textBody = `${args.body}\n\n${args.link ?? ""}`.trim()
const htmlBody = `      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2 style="margin:0 0 8px 0">${escapeHtml(args.title)}</h2>
        <p style="margin:0 0 12px 0">${escapeHtml(args.body)}</p>
        ${args.link ?`<p><a href="${args.link}">Open in TrustLens</a></p>`: ""}
        <hr />
        <p style="color:#667085;font-size:12px">You are receiving this because alerts are enabled for your brand.</p>
      </div>
   `.trim()

    for (const toEmail of args.toEmails) {
      await enqueueEmail({
        brandId: args.brandId,
        toEmail,
        subject,
        htmlBody,
        textBody
      })
    }

}
}

function escapeHtml(input: string) {
return input
.replaceAll("&", "&amp;")
.replaceAll("<", "&lt;")
.replaceAll(">", "&gt;")
.replaceAll('"', "&quot;")
.replaceAll("'", "&#039;")
}

2.4 Email outbox and queue (real-time delivery)

Use BullMQ + Redis for reliable real-time sending.

Install:

npm i bullmq ioredis nodemailer

src/services/emailOutbox.service.ts

import { prisma } from "@/src/lib/prisma"
import { emailQueue } from "@/src/queues/email.queue"

export async function enqueueEmail(args: {
brandId: string
toEmail: string
subject: string
htmlBody: string
textBody?: string
}) {
const outbox = await prisma.emailOutbox.create({
data: {
brandId: args.brandId,
toEmail: args.toEmail,
subject: args.subject,
htmlBody: args.htmlBody,
textBody: args.textBody ?? null,
status: "PENDING"
}
})

await emailQueue.add("send-email", { outboxId: outbox.id }, { attempts: 5, backoff: { type: "exponential", delay: 5000 } })
return outbox
}

src/queues/email.queue.ts

import { Queue } from "bullmq"
import IORedis from "ioredis"

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379")

export const emailQueue = new Queue("emailQueue", { connection })
export const emailQueueConnection = connection

src/workers/email.worker.ts

import { Worker } from "bullmq"
import nodemailer from "nodemailer"
import { prisma } from "@/src/lib/prisma"
import { emailQueueConnection } from "@/src/queues/email.queue"

const transporter = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port: Number(process.env.SMTP_PORT || 587),
secure: false,
auth: {
user: process.env.SMTP_USER,
pass: process.env.SMTP_PASS
}
})

export const emailWorker = new Worker(
"emailQueue",
async (job) => {
const { outboxId } = job.data as { outboxId: string }

    const outbox = await prisma.emailOutbox.findUnique({ where: { id: outboxId } })
    if (!outbox) return

    if (outbox.status === "SENT") return

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || "TrustLens <no-reply@trustlens.co.za>",
        to: outbox.toEmail,
        subject: outbox.subject,
        text: outbox.textBody ?? undefined,
        html: outbox.htmlBody
      })

      await prisma.emailOutbox.update({
        where: { id: outboxId },
        data: {
          status: "SENT",
          sentAt: new Date(),
          attempts: outbox.attempts + 1,
          lastError: null
        }
      })
    } catch (err: any) {
      await prisma.emailOutbox.update({
        where: { id: outboxId },
        data: {
          status: "FAILED",
          attempts: outbox.attempts + 1,
          lastError: String(err?.message || err)
        }
      })
      throw err
    }

},
{ connection: emailQueueConnection }
)

Run the worker as a separate process:

node -r ts-node/register src/workers/email.worker.ts

In Docker Compose you will add a worker service and a redis service.

3. Hook alerts into complaint lifecycle

You already have complaint creation and brand routing. Add this in your complaint creation service once you know brandId and the complaint is created.

src/services/complaint.service.ts addition:

import { notifyBrand } from "@/src/services/notification.service"

export async function onComplaintCreated(complaint: { id: string; brandId: string; title?: string }) {
const brandMembers = await getBrandMemberEmails(complaint.brandId) // implement using your membership table

await notifyBrand({
brandId: complaint.brandId,
type: "COMPLAINT_CREATED",
title: "New complaint received",
body: `A new complaint was submitted and is awaiting review.`,
link: `${process.env.APP_URL}/brand/complaints/${complaint.id}`,
metadata: { complaintId: complaint.id },
toEmails: brandMembers
})
}

async function getBrandMemberEmails(brandId: string): Promise<string[]> {
const members = await prisma.brandMember.findMany({
where: { brandId, isActive: true },
include: { user: true }
})
return members.map(m => m.user.email).filter(Boolean)
}

Also hook these events similarly:

When complaint escalated. COMPLAINT_ESCALATED

When consumer adds a message. NEW_CONSUMER_MESSAGE

When evidence added. EVIDENCE_ADDED

4. In-app notifications API
   4.1 List notifications (brand user)

src/app/api/brand/notifications/route.ts

import { prisma } from "@/src/lib/prisma"
import { requireBrandUser } from "@/src/server/auth/requireBrandUser"

export async function GET() {
const session = await requireBrandUser()
const brandId = session.brandId

const items = await prisma.notification.findMany({
where: { brandId },
orderBy: { createdAt: "desc" },
take: 30
})

const unreadCount = await prisma.notification.count({
where: { brandId, isRead: false }
})

return Response.json({ unreadCount, items })
}

4.2 Mark as read

src/app/api/brand/notifications/read/route.ts

import { prisma } from "@/src/lib/prisma"
import { requireBrandUser } from "@/src/server/auth/requireBrandUser"

export async function POST(req: Request) {
const session = await requireBrandUser()
const brandId = session.brandId
const { notificationId } = await req.json()

await prisma.notification.updateMany({
where: { id: notificationId, brandId },
data: { isRead: true, readAt: new Date() }
})

return Response.json({ ok: true })
}

4.3 Mark all read

src/app/api/brand/notifications/read-all/route.ts

import { prisma } from "@/src/lib/prisma"
import { requireBrandUser } from "@/src/server/auth/requireBrandUser"

export async function POST() {
const session = await requireBrandUser()
const brandId = session.brandId

await prisma.notification.updateMany({
where: { brandId, isRead: false },
data: { isRead: true, readAt: new Date() }
})

return Response.json({ ok: true })
}

5. Brand UI. Bell icon with dropdown and unread badge

Uses shadcn/ui components and lucide icons.

Install:

npm i lucide-react

5.1 Component

app/(brand)/\_components/BrandBell.tsx

"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

type NotificationItem = {
id: string
title: string
body: string
link: string | null
isRead: boolean
createdAt: string
}

export function BrandBell() {
const [unreadCount, setUnreadCount] = useState(0)
const [items, setItems] = useState<NotificationItem[]>([])
const [open, setOpen] = useState(false)

async function refresh() {
const res = await fetch("/api/brand/notifications", { cache: "no-store" })
const data = await res.json()
setUnreadCount(data.unreadCount)
setItems(data.items)
}

useEffect(() => {
refresh()
const t = setInterval(refresh, 15000)
return () => clearInterval(t)
}, [])

async function markRead(id: string) {
await fetch("/api/brand/notifications/read", {
method: "POST",
body: JSON.stringify({ notificationId: id })
})
await refresh()
}

async function markAllRead() {
await fetch("/api/brand/notifications/read-all", { method: "POST" })
await refresh()
}

const hasUnread = unreadCount > 0

return (
<DropdownMenu open={open} onOpenChange={setOpen}>
<DropdownMenuTrigger asChild>
<Button variant="ghost" className="relative h-10 w-10 rounded-full">
<Bell className="h-5 w-5" />
{hasUnread && (
<span className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-white">
{unreadCount > 99 ? "99+" : unreadCount}
</span>
)}
</Button>
</DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-primary hover:underline"
            type="button"
          >
            Mark all read
          </button>
        </div>
        <DropdownMenuSeparator />

        <ScrollArea className="h-[360px]">
          {items.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            items.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex cursor-pointer flex-col items-start gap-1 px-3 py-3"
                onSelect={async () => {
                  await markRead(n.id)
                  if (n.link) window.location.href = n.link
                }}
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold ${n.isRead ? "opacity-80" : ""}`}>
                      {n.title}
                    </div>
                    <div className={`text-xs text-muted-foreground ${n.isRead ? "opacity-80" : ""}`}>
                      {n.body}
                    </div>
                  </div>

                  {!n.isRead && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>

                <div className="text-[11px] text-muted-foreground">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>

        <DropdownMenuSeparator />
        <div className="px-3 py-2">
          <Link className="text-sm font-semibold text-primary hover:underline" href="/brand/notifications">
            View all
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>

)
}

5.2 Add bell to brand header layout

In your brand layout header file, add:

import { BrandBell } from "./\_components/BrandBell"

export function BrandHeader() {
return (

<header className="flex items-center justify-between px-4 py-3">
<div className="text-lg font-bold">TrustLens</div>
<div className="flex items-center gap-2">
<BrandBell />
</div>
</header>
)
}

6. Dedicated notifications page (optional but professional)

app/(brand)/brand/notifications/page.tsx

Fetch /api/brand/notifications and render a full list with filters. If you want, I will implement it next.

7. Environment variables

Add to .env:

APP_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379

SMTP_HOST=smtp.yourprovider.co.za
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
EMAIL_FROM=TrustLens <no-reply@trustlens.co.za>

8. What “real-time” means here

Complaint arrives. Notification created immediately in DB

Email queued immediately in Outbox and sent via worker

Brand bell updates by polling every 15 seconds (stable and simple)

If you want true push (WebSockets), we can add it, but polling is usually best practice early. It is reliable and avoids socket ops complexity.

9. Tests you should add now
   Backend

On complaint creation, creates Notification

Enqueues EmailOutbox row

Worker marks EmailOutbox SENT or FAILED

Notifications API returns unread count correctly

Mark read endpoints enforce brand scope

If you want, I can add the Jest + Supertest suite for all of these in the same style as earlier tests.
