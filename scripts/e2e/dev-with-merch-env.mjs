/**
 * Boot `next dev` with merchandising E2E env (Docker mode only).
 */
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadMerchE2eEnv } from "./merch-e2e-env.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

if (process.env.MERCH_E2E_LOCALHOST === "1") {
  console.error(
    "dev-with-merch-env.mjs is for Docker mode. Localhost mode reuses your running storefront.",
  );
  process.exit(1);
}

const env = loadMerchE2eEnv();
env.E2E_USE_WEBPACK = "1";
const port = env.STOREFRONT_E2E_PORT || "3002";

const child = spawn(
  "pnpm",
  ["exec", "next", "dev", "-p", port, "--webpack"],
  {
    cwd: repoRoot,
    env,
    stdio: "inherit",
    shell: true,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
