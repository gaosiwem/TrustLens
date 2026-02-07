import { prisma } from "../src/lib/prisma.js";
async function main() {
    console.log("Verifying brand alert preferences...");
    const prefs = await prisma.brandAlertPreference.findMany({
        take: 5,
    });
    console.log("Sample preferences:", JSON.stringify(prefs, null, 2));
}
main()
    .catch((e) => console.error(e))
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=check-alert-prefs.js.map