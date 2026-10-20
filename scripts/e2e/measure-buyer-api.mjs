import { readFileSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";

Object.assign(process.env, parseEnv(readFileSync(".env.local", "utf8").replace(/^\uFEFF/, "")));
const origin = new URL(process.env.SPREE_API_URL).origin;
if (origin !== "http://127.0.0.1:3011") throw new Error("Isolated API required");
const headers = { "X-Spree-API-Key": process.env.SPREE_PUBLISHABLE_KEY, "Content-Type": "application/json" };
const timings = [];
let token;
async function measure(path, options = {}) {
  const started = performance.now();
  const response = await fetch(`${origin}/api/v3/store/${path}`, { headers, ...options, signal: AbortSignal.timeout(60000) });
  const text = await response.text();
  timings.push({ path, status: response.status, durationMs: Math.round(performance.now() - started) });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return JSON.parse(text);
}
for (let iteration = 0; iteration < 4; iteration++) {
  const session = await measure("auth/login", { method: "POST", body: JSON.stringify({ email: "dev-buyer-001@example.com", password: "spree123" }) });
  token = session.token;
  if (!token) throw new Error("Login token missing");
  headers.Authorization = `Bearer ${token}`;
  await measure("customers/me");
  await measure("customers/me/message_threads");
  delete headers.Authorization;
}
const evidence = { api: origin, measuredAt: new Date().toISOString(), warmup: timings.slice(0, 3), warm: timings.slice(3) };
writeFileSync("test-results/buyer-api-timings.json", JSON.stringify(evidence, null, 2));
console.log(JSON.stringify(evidence));
