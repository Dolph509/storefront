import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";

function loadMerchE2eEnv() {
  const env = { ...process.env };
  const localhost = env.MERCH_E2E_LOCALHOST === "1";
  const envFile = localhost
    ? join(process.cwd(), ".env.merch-localhost")
    : join(process.cwd(), ".env.merch-e2e");

  if (!localhost && !existsSync(envFile)) {
    console.error(
      ".env.merch-e2e not found. Run ./scripts/e2e/bootstrap-merchandising.sh first.",
    );
    process.exit(1);
  }

  if (localhost && !existsSync(envFile)) {
    console.error(
      ".env.merch-localhost not found. Run pnpm e2e:merch:localhost:bootstrap from the monorepo root first.",
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

function merchStorefrontBaseUrl(env: NodeJS.ProcessEnv) {
  if (env.MERCH_E2E_STOREFRONT_URL) {
    return env.MERCH_E2E_STOREFRONT_URL.replace(/\/$/, "");
  }
  const port = env.STOREFRONT_E2E_PORT || "3002";
  return `http://localhost:${port}`;
}

const localhost = process.env.MERCH_E2E_LOCALHOST === "1";
const env = loadMerchE2eEnv();
for (const [key, value] of Object.entries(env)) {
  if (value !== undefined) {
    process.env[key] = value;
  }
}
const baseURL =
  process.env.BASE_URL?.replace(/\/$/, "") || merchStorefrontBaseUrl(env);

/**
 * Playwright config for merchandising-signals E2E.
 *
 * Docker stack:
 *   pnpm run e2e:merch:up
 *   MERCH_E2E_LOCALHOST=0 pnpm run test:e2e:merch
 *
 * Local dev services (Rails :3010, storefront :3001):
 *   pnpm e2e:merch:localhost:bootstrap
 *   MERCH_E2E_LOCALHOST=1 pnpm run test:e2e:merch
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: [
    "merchandising-signals.spec.ts",
    "merchandising-api-isolation.spec.ts",
    "merchandising-guest-isolation.spec.ts",
    "merchandising-search.spec.ts",
    "merchandising-search-attribution.spec.ts",
    "merchandising-pdp.spec.ts",
    "merchandising-responsive.spec.ts",
    "merchandising-recommended-fallback.spec.ts",
    "merchandising-seller-storefront.spec.ts",
    "merchandising-homepage-attribution.spec.ts",
    "privacy-personalization.spec.ts",
  ],
  timeout: 120_000,
  fullyParallel: !!process.env.CI && !localhost,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI || localhost ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: process.env.CI ? 30_000 : 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  ...(localhost
    ? {}
    : {
        webServer: {
          command: "node ./scripts/e2e/dev-with-merch-env.mjs",
          url: `${baseURL}/us/en/collections/merchandising-signals`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          stdout: "pipe",
          stderr: "pipe",
        },
      }),
});
