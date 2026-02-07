import prisma from "./src/prismaClient.js";
async function main() {
    console.log("Prisma imported successfully");
    try {
        await prisma.$connect();
        console.log("Connected!");
        await prisma.$disconnect();
    }
    catch (e) {
        console.error(e);
    }
}
main();
//# sourceMappingURL=test-prisma.js.map