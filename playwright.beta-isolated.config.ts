import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, devices } from "@playwright/test";
import {
  BETA_BUYER_DESKTOP_SPECS,
  BETA_ISOLATED_BUYER_SPECS,
} from "./e2e/beta-isolated-buyer.manifest";

const repoRoot = process.cwd();
const envFile = join(repoRoot, ".env.local");

function loadEnvLocal() {
  const env = { ...process.env };
  if (!existsSync(envFile)) {
    console.error(
      ".env.local not found — point SPREE_API_URL at isolated :3011",
    );
    process.exit(1);
  }
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
  env.MARKETPLACE_E2E_REQUIRED = "1";
  env.SPREE_REVIEW_E2E = "1";
  return env;
}

const env = loadEnvLocal();
if (new URL(env.SPREE_API_URL || "http://invalid").port !== "3011") {
  throw new Error(
    "Buyer beta verification requires the isolated Rails API on port 3011",
  );
}
for (const [key, value] of Object.entries(env)) {
  if (value !== undefined) process.env[key] = value;
}

const port = env.STOREFRONT_E2E_PORT || "3302";
const baseURL = `http://localhost:${port}`;
const desktopClosure = process.env.BETA_BUYER_DESKTOP === "1";
const preview = process.env.E2E_PREVIEW === "1";
env.STOREFRONT_E2E_PORT = port;
env.NEXT_PUBLIC_SITE_URL = baseURL;
env.COOKIE_SECURE = "false";
env.THEME_TEMPLATE_COLLECTION_ENABLED = "0";
env.THEME_TEMPLATE_PRODUCT_ENABLED = "0";

export default defineConfig({
  testDir: "./e2e",
  testMatch: desktopClosure
    ? [...BETA_BUYER_DESKTOP_SPECS]
    : BETA_ISOLATED_BUYER_SPECS.filter(
        (file) => file !== "multi-seller-checkout.spec.ts",
      ),
  timeout: 300_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    [
      "json",
      {
        outputFile: desktopClosure
          ? "test-results/buyer-desktop-report.json"
          : "test-results/beta-isolated-report.json",
      },
    ],
  ],
  outputDir: desktopClosure
    ? "test-results/buyer-desktop"
    : "test-results/beta-isolated",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "on",
    video: "off",
    navigationTimeout: 180_000,
  },
  projects: desktopClosure
    ? [{ name: "desktop", use: { ...devices["Desktop Chrome"] } }]
    : [
        { name: "desktop", use: { ...devices["Desktop Chrome"] } },
        {
          name: "mobile",
          use: { ...devices["Pixel 7"] },
        },
      ],
  ...(process.env.PLAYWRIGHT_REUSE_STOREFRONT === "1"
    ? {}
    : {
        webServer: {
          command: preview
            ? `node node_modules/next/dist/bin/next start -p ${port}`
            : `node node_modules/next/dist/bin/next dev -p ${port} --webpack`,
          url: `${baseURL}/us/en`,
          reuseExistingServer: !preview,
          timeout: preview ? 120_000 : 180_000,
          env: preview
            ? { ...env, NODE_ENV: "production" }
            : { ...env, E2E_USE_WEBPACK: "1" },
          stdout: "pipe",
          stderr: "pipe",
        },
      }),
});
