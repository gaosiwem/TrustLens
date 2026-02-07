import { prisma } from "./src/lib/prisma.js";
async function main() {
    const userId = "fc1e8eca-4eb1-4ee4-b2d8-a6d8849ee9a1"; // manager id
    const brandId = "d9f6b727-2bfc-46d1-b671-18daa8e218a1"; // mit mak motors id
    const notifications = [
        {
            userId,
            brandId,
            type: "COMPLAINT_CREATED",
            title: "New Complaint: Engine Issues",
            body: "A customer has submitted a high-urgency complaint regarding engine failure.",
            link: "/brand/complaints/974ee853-ffc9-47f9-b99b-1ccfbb80c3b5",
            priority: "high",
        },
        {
            userId,
            brandId,
            type: "COMPLAINT_ESCALATED",
            title: "Escalation Alert: Warranty Claim",
            body: "Complaint #1034 has been escalated to management review.",
            link: "/brand/complaints/974ee853-ffc9-47f9-b99b-1ccfbb80c3b5",
            priority: "critical",
        },
        {
            userId,
            brandId,
            type: "NEW_CONSUMER_MESSAGE",
            title: "New Message from Sarah J.",
            body: "I am still waiting for the refund confirmation we discussed.",
            link: "/brand/complaints",
            priority: "info",
        },
        {
            userId,
            brandId,
            type: "SYSTEM_ALERT",
            title: "Reputation Score Update",
            body: "Your brand reputation score has improved by 5 points this week!",
            link: "/brand/dashboard",
            priority: "info",
        },
        {
            userId,
            brandId,
            type: "STATUS_CHANGED",
            title: "Verification Approved",
            body: "Congratulations! Your brand verification documents have been approved.",
            link: "/brand/profile",
            priority: "info",
        },
    ];
    console.log(`Inserting ${notifications.length} notifications...`);
    for (const notif of notifications) {
        await prisma.notification.create({
            data: {
                ...notif,
                read: false,
            },
        });
    }
    console.log("Done!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=create_bulk_notifs.js.map