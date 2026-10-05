import { defineConfig, devices } from "@playwright/test";

const storefrontPort = process.env.STOREFRONT_E2E_PORT || "3001";

/**
 * Playwright config for the storefront E2E suite.
 *
 * Prerequisites (run once before `pnpm run test:e2e`):
 *   pnpm run e2e:up     # boots Docker + bootstraps Spree via @spree/cli
 *
 * That seeds Spree with sample data and writes `.env.e2e` with the
 * publishable key the storefront needs.
 *
 * The `webServer` block boots `next dev` against `.env.e2e` and waits for it
 * to respond before running tests.
 */
export default defineConfig({
  testDir: "./e2e",
  // The guest checkout walks home → PDP → cart → checkout → Stripe against
  // dev-mode Next.js + dockerized Spree, which blows well past Playwright's
  // 30s default on CI runners — each retry was dying mid-flow wherever it
  // happened to be standing.
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
    // Local `next dev` compiles on demand; a single route can take tens of seconds.
    navigationTimeout: process.env.CI ? 30_000 : 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Node wrapper mirrors dev-with-env.sh (POSIX shell is unreliable on Windows).
    command: "node ./scripts/e2e/dev-with-env.mjs",
    // Wait on the product route exercised by the commerce E2E specs. The
    // homepage can fail independently when preview-only theme data is stale.
    url: `http://localhost:${storefrontPort}/us/en/products/dev-dataset-dev-seller-01-storefront-sku`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
