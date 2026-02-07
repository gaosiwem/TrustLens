import axios from "axios";
async function checkBackend() {
    const url = "http://localhost:4000"; // Assuming backend port
    try {
        console.log(`Pinging ${url}...`);
        const res = await axios.get(url);
        console.log("Root Response:", res.data);
    }
    catch (err) {
        if (err.code === "ECONNREFUSED") {
            console.error("Backend connection refused. Is the server running?");
        }
        else {
            console.error("Backend Error:", err.message);
        }
    }
    // Attempt to hit the team endpoint without auth to check 401 vs 404
    const brandId = "f385a184-11f0-4636-9845-cc8fdb538cd4"; // Checkers
    const teamUrl = `${url}/brands/${brandId}/team`;
    try {
        console.log(`Pinging ${teamUrl} (expecting 401)...`);
        await axios.get(teamUrl);
    }
    catch (err) {
        console.log("Team Endpoint Response:", err.response?.status, err.response?.statusText);
        if (err.response?.status === 404) {
            console.error("CRITICAL: Route not found! verify brand.routes.ts");
        }
    }
}
checkBackend();
//# sourceMappingURL=test-team-endpoint.js.map