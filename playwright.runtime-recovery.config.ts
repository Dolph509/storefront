import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "runtime-recovery.spec.ts",
  timeout: 180_000,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3302",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chrome-runtime-recovery",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
});
