import { prisma } from "./Backend/src/lib/prisma.js";

async function sendTestNotification() {
  const userId = "ec2375e8-92a6-4000-8732-80463c71cd82"; // manager id
  const brandId = "77f34479-703f-401a-acfe-7eba8039a590"; // mit mak motors id

  console.log("Sending test notification...");

  const notification = await prisma.notification.create({
    data: {
      userId,
      brandId,
      type: "SYSTEM_ALERT",
      title: "Verification Milestone",
      body: "Your brand verification has reached a new milestone. Click to view progress.",
      link: "/brand/verification",
      priority: "warning",
      read: false,
    },
  });

  console.log("Created notification:", notification.id);
  process.exit(0);
}

sendTestNotification();
