import { PrismaClient } from "@prisma/client";
import { getBrandVerificationStatus } from "../src/modules/verification/verification.controller.js";
const prisma = new PrismaClient();
// Mock Express Objects
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        console.log(`Response Status: ${code}`);
        return res;
    };
    res.json = (data) => {
        console.log("Response JSON:", JSON.stringify(data, null, 2));
        return res;
    };
    return res;
};
async function debugStatus() {
    const brandId = "77f34479-703f-401a-acfe-7eba8039a590"; // Mit Mak Motors
    console.log(`Testing status for brandId: ${brandId}`);
    const req = {
        user: {
            brandId: brandId,
            userId: "ec2375e8-92a6-4000-8732-80463c71cd82",
            role: "BRAND",
        },
    };
    await getBrandVerificationStatus(req, mockRes());
}
debugStatus()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=debug-status.js.map