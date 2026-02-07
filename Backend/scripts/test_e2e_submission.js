import axios from "axios";
import FormData from "form-data";
async function testFullFlow() {
    const API_URL = "http://127.0.0.1:4000";
    try {
        console.log("--- Starting E2E Test Flow ---");
        // 1. Login to get token
        console.log("Logging in...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: "e2e_tester@example.com",
            password: "password123",
        });
        // The backend returns 'token', not 'accessToken'
        const token = loginRes.data.token;
        if (!token) {
            console.error("Login failed: No token in response", loginRes.data);
            return;
        }
        console.log("Logged in successfully. Token received.");
        // 2. Submit complaint
        console.log("Submitting complaint...");
        const formData = new FormData();
        formData.append("brandName", "E2ETestBrand " + Date.now());
        formData.append("title", "E2E Test Complaint");
        formData.append("description", "This is an E2E test to find the hang.");
        const res = await axios.post(`${API_URL}/complaints`, formData, {
            headers: {
                ...formData.getHeaders(),
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Submission SUCCESS:", res.data.id);
    }
    catch (err) {
        if (err.response) {
            console.error("Submission FAILED Status:", err.response.status);
            console.error("Submission FAILED Data:", err.response.data);
        }
        else {
            console.error("Submission FAILED Error:", err.message);
        }
    }
    finally {
        process.exit(0);
    }
}
testFullFlow();
//# sourceMappingURL=test_e2e_submission.js.map