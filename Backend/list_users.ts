import prisma from "./src/prismaClient.js";

async function listUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });
  console.log(JSON.stringify(users, null, 2));
  process.exit(0);
}

listUsers();
