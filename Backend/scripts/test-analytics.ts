import axios from "axios";

async function main() {
  const API_URL = "http://localhost:4000/api";
  // Assuming we have a brand ID. I will pick one from the DB or mock it if the backend allows invalid IDs (it should probably 404 or log anyway).
  // Let's rely on backend not crashing.

  // We need a dummy brand ID.
  const brandId = "test-brand-id";

  console.log("Testing Badge Click Tracking...");
  try {
    await axios.post(`${API_URL}/analytics/brands/${brandId}/badge-click`);
    console.log("✅ Badge click tracked successfully.");
  } catch (error) {
    console.error(
      "❌ Failed to track badge click:",
      error?.response?.data || error.message,
    );
  }
}

main();
