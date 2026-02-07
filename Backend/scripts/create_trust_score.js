import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const brandId = "77f34479-703f-401a-acfe-7eba8039a590";
    const score = await prisma.trustScore.create({
        data: {
            entityType: "BRAND",
            entityId: brandId,
            score: 75,
            riskLevel: "LOW",
            metadata: {
                factors: {
                    authenticity: 80,
                    activity: 90,
                    verification: 70,
                },
                calculation: {
                    totalComplaints: 4,
                    resolvedComplaints: 2,
                    highRiskResponses: 0,
                    isVerified: true,
                    plan: "Free",
                },
            },
        },
    });
    console.log(JSON.stringify(score));
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=create_trust_score.js.map