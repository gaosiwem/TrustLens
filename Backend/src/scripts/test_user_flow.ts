import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const API_URL = "http://localhost:4000"; // Make sure this port is correct!
const EMAIL = "admin@checkers.com";
const PASSWORD = "adminpassword123";

async function main() {
  console.log("🚀 Starting End-to-End Verification Flow Test for:", EMAIL);

  try {
    // 1. Login
    console.log("\n1️⃣  Logging in...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD,
    });

    // Explicitly Log the token structure to be sure
    // console.log("Login Response Data Keys:", Object.keys(loginRes.data));

    const token = loginRes.data.token || loginRes.data.accessToken;
    const brandId = loginRes.data.user.brandId;

    if (!token) {
      throw new Error("No token returned from login!");
    }

    console.log("✅ Login successful.");
    console.log("   Brand ID:", brandId);
    console.log("   Token starts with:", token.substring(0, 10) + "...");

    // 2. Check Initial Status
    console.log("\n2️⃣  Checking Initial Verification Status...");
    try {
      let statusRes = await axios.get(`${API_URL}/verified/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("   Current Status Response:", statusRes.data);

      // Frontend logic maps: status='approved' + !verifiedUntil -> Payment Required
      if (
        statusRes.data.status === "approved" &&
        !statusRes.data.verifiedUntil
      ) {
        console.log("✅ Confirmed: User is in 'Payment Required' state.");
      } else {
        console.log("ℹ️  Current state:", statusRes.data);
      }
    } catch (err: any) {
      console.error(
        "❌ Failed to check status:",
        err.response?.status,
        err.response?.data,
      );
      // Don't exit, try payment anyway just in case
    }

    // 3. Simulate Payment (via Dev Activation)
    console.log(
      "\n3️⃣  Simulating Subscription Payment (Reference: " + brandId + ")...",
    );

    try {
      const payRes = await axios.post(
        `${API_URL}/subscriptions/dev-activate`,
        {
          planCode: "BASIC_VERIFIED",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      console.log("✅ Payment Simulation Successful:", payRes.data.message);
    } catch (err: any) {
      console.error(
        "❌ Failed to activate subscription:",
        err.response?.status,
        err.response?.data,
      );
      return; // Can't proceed
    }

    // 4. Check Final Status
    console.log("\n4️⃣  Checking Final Verification Status...");
    try {
      const finalRes = await axios.get(`${API_URL}/verified/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("   Final Status Response:", finalRes.data);

      // Success criteria: Status is Approved AND verifiedUntil is present (Active)
      if (finalRes.data.status === "approved" && finalRes.data.verifiedUntil) {
        console.log("🎉 SUCCESS: User is successfully VERIFIED and ACTIVE!");
      } else {
        console.log("❌ FAILURE: Verify status is not fully active yet.");
      }
    } catch (err: any) {
      console.error(
        "❌ Failed to check final status:",
        err.response?.status,
        err.response?.data,
      );
    }
  } catch (error: any) {
    console.error("❌ Test Failed:", error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
