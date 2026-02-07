import { createComplaint } from "./src/modules/complaints/complaint.service.js";
import prisma from "./src/prismaClient.js";
import logger from "./src/config/logger.js";
async function testSubmit() {
    try {
        logger.info("--- Starting Test Submission ---");
        // Get a valid user ID (assuming any user exists)
        const user = await prisma.user.findFirst();
        if (!user) {
            logger.error("No user found in DB to test with.");
            return;
        }
        logger.info("Testing with user: %s", user.id);
        const result = await createComplaint({
            userId: user.id,
            brandName: "TestBrand " + Date.now(),
            title: "Test Complaint",
            description: "This is a test complaint to debug the hang issue.",
            attachments: [],
        });
        logger.info("Test submission SUCCESS: %s", result.id);
    }
    catch (err) {
        logger.error("Test submission FAILED:", err);
    }
    finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}
testSubmit();
//# sourceMappingURL=test_submission.js.map