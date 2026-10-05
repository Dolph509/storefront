/**
 * Shared env loader for merchandising Playwright (Docker or localhost).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

export function loadMerchE2eEnv() {
  const env = { ...process.env };
  const localhost = env.MERCH_E2E_LOCALHOST === "1";
  const envFile = localhost
    ? join(repoRoot, ".env.merch-localhost")
    : join(repoRoot, ".env.merch-e2e");

  if (!localhost && !existsSync(envFile)) {
    console.error(
      ".env.merch-e2e not found. Run ./scripts/e2e/bootstrap-merchandising.sh first.",
    );
    process.exit(1);
  }

  if (localhost && !existsSync(envFile)) {
    console.error(
      ".env.merch-localhost not found. Run node ./scripts/e2e/bootstrap-merchandising-localhost.mjs first.",
    );
    process.exit(1);
  }

  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }

  env.MARKETPLACE_E2E_REQUIRED = env.MARKETPLACE_E2E_REQUIRED || "1";
  if (localhost) {
    env.MERCH_E2E_LOCALHOST = "1";
  }
  return env;
}

export function merchStorefrontBaseUrl(env = process.env) {
  if (env.MERCH_E2E_STOREFRONT_URL) {
    return env.MERCH_E2E_STOREFRONT_URL.replace(/\/$/, "");
  }
  const port = env.STOREFRONT_E2E_PORT || "3002";
  return `http://localhost:${port}`;
}

export function merchApiBaseUrl(env = process.env) {
  if (env.MERCH_E2E_API_URL) {
    return env.MERCH_E2E_API_URL.replace(/\/$/, "");
  }
  const api = env.SPREE_API_URL || "http://localhost:4010/api/v3/store";
  return api.replace(/\/api\/v3\/store\/?$/, "");
}
