import pg from "pg";
const { Client } = pg;

async function testPg() {
  const connectionString =
    "postgresql://neondb_owner:npg_lysba2Ct1RMO@ep-aged-star-ahqdf6po.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";
  console.log(`Testing direct PG connection...`);

  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log("✅ PG connection successful!");
    const res = await client.query('SELECT email FROM "User" LIMIT 1');
    console.log("Query result:", res.rows);
  } catch (err) {
    console.error("❌ PG connection failed:");
    console.error(err);
  } finally {
    await client.end();
  }
}

testPg();
