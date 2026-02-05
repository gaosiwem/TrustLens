import http from "http";
import https from "https";

const BACKEND_URL = "http://localhost:4000";
const FRONTEND_URL = "http://localhost:3000";

const results = {};

const runLoad = async (
  name,
  url,
  method = "GET",
  body = null,
  headers = {},
  duration = 5,
  concurrency = 10,
) => {
  console.log(`\nStarting load test: ${name} (${url})`);
  let requests = 0;
  let errors = 0;
  let latencies = [];
  const start = Date.now();
  const end = start + duration * 1000;

  const worker = async () => {
    while (Date.now() < end) {
      const reqStart = Date.now();
      try {
        await new Promise((resolve, reject) => {
          const lib = url.startsWith("https") ? https : http;
          const req = lib.request(
            url,
            {
              method,
              headers: { "Content-Type": "application/json", ...headers },
            },
            (res) => {
              let data = "";
              res.on("data", (c) => (data += c));
              res.on("end", () => {
                latencies.push(Date.now() - reqStart);
                if (res.statusCode >= 400) errors++;
                requests++;
                resolve();
              });
            },
          );
          req.on("error", (e) => {
            errors++;
            reject(e);
          });
          if (body) req.write(JSON.stringify(body));
          req.end();
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const workers = Array(concurrency)
    .fill(0)
    .map(() => worker());
  await Promise.all(workers);

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const rps = requests / duration;

  results[name] = { p50, p95, p99, rps, errors, requests };
  console.log(
    `  -> p95: ${p95}ms | RPS: ${rps.toFixed(1)} | Errors: ${errors}`,
  );
};

async function main() {
  // 1. Public Journey: Search Brands
  await runLoad(
    "Public: Search Brands",
    `${BACKEND_URL}/brands/public/search?q=Checkers`,
  );

  // 2. Auth Journey: Login
  await runLoad("Auth: Login", `${BACKEND_URL}/auth/login`, "POST", {
    email: "admin@trustlens.com",
    password: "Password123!",
  });

  // Get a token
  let token = "";
  const loginReq = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@trustlens.com",
      password: "Password123!",
    }),
  });

  if (loginReq.ok) {
    const data = await loginReq.json();
    token = data.token;
    console.log(`\nAuthenticated. Token length: ${token.length}`);

    // 3. Protected Journey: List All Brands (Dashboard proxy)
    // This endpoint returns a list of brands.
    await runLoad(
      "Protected: Dashboard List",
      `${BACKEND_URL}/brands?limit=10`,
      "GET",
      null,
      {
        Authorization: `Bearer ${token}`,
      },
    );
  } else {
    console.error(
      "Failed to get token for protected routes tests. Login response:",
      await loginReq.text(),
    );
  }

  console.log("\n--- Final Results JSON ---");
  console.log(JSON.stringify(results, null, 2));
}

main();
