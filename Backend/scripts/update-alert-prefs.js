import { prisma } from "../src/lib/prisma.js";
async function main() {
    console.log("Updating all existing brand alert preferences...");
    const result = await prisma.brandAlertPreference.updateMany({
        data: {
            statusChanges: true,
            evidenceAdded: true,
            dailyDigestEnabled: true,
            newMessages: true,
            escalations: true,
            complaintCreated: true,
        },
    });
    console.log(`Updated ${result.count} preference records.`);
}
main()
    .catch((e) => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=update-alert-prefs.js.map