import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function checkAllRequests() {
    const allRequests = await prisma.verifiedRequest.findMany({
        include: {
            brand: { select: { name: true } },
            user: { select: { email: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    console.log(`Total verification requests: ${allRequests.length}\n`);
    allRequests.forEach((req, idx) => {
        console.log(`${idx + 1}. ${req.brand.name} - Status: ${req.status}`);
        console.log(`   Requested by: ${req.user.email}`);
        console.log(`   Created: ${req.createdAt}`);
        console.log(`   Updated: ${req.updatedAt}\n`);
    });
}
checkAllRequests()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check-all-requests.js.map