import { defineConfig, devices } from "@playwright/test";

const storefrontPort = process.env.STOREFRONT_E2E_PORT || "3002";

/**
 * Playwright config for merchandising-signals E2E.
 *
 * Prerequisites:
 *   pnpm run e2e:merch:up
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
  fullyParallel: !!process.env.CI,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${storefrontPort}`,
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
  webServer: {
    command: "node ./scripts/e2e/dev-with-merch-env.mjs",
    url: `http://localhost:${storefrontPort}/us/en/collections/merchandising-signals`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
