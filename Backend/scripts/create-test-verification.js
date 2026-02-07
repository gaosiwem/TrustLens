import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function createTestVerificationRequest() {
    // Find a brand to use
    const brand = await prisma.brand.findFirst({
        where: { id: "fd766cd1-7196-4114-9438-ba1ec7c4ad66" },
        include: { manager: true },
    });
    if (!brand || !brand.manager) {
        console.error("No brand with manager found. Please create a brand first.");
        return;
    }
    console.log(`Creating verification request for: ${brand.name}`);
    // Create a verification request
    const request = await prisma.verifiedRequest.create({
        data: {
            brandId: brand.id,
            userId: brand.managerId,
            companyName: brand.name,
            status: "PENDING",
            documents: [
                {
                    type: "business_registration",
                    path: "/uploads/test-business-reg.pdf",
                    originalName: "business-registration.pdf",
                    uploadedAt: new Date().toISOString(),
                },
                {
                    type: "director_id",
                    path: "/uploads/test-director-id.pdf",
                    originalName: "director-id.pdf",
                    uploadedAt: new Date().toISOString(),
                },
                {
                    type: "proof_of_address",
                    path: "/uploads/test-proof-address.pdf",
                    originalName: "proof-of-address.pdf",
                    uploadedAt: new Date().toISOString(),
                },
            ],
        },
    });
    console.log(`✅ Created verification request: ${request.id}`);
    console.log(`Brand: ${brand.name}`);
    console.log(`User: ${brand.manager.email}`);
    console.log(`\nNow you can run 'npx tsx scripts/simulate-payment.ts' to simulate payment`);
}
createTestVerificationRequest()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=create-test-verification.js.map