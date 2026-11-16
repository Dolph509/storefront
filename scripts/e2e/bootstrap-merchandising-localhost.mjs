/**
 * Bootstrap merchandising Playwright against already-running local dev services.
 *
 * Usage (from storefront/):
 *   pnpm run e2e:merch:localhost:bootstrap
 */
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const monorepoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const bootstrap = join(monorepoRoot, "scripts", "e2e", "bootstrap-merchandising-localhost.mjs");

const result = spawnSync(process.execPath, [bootstrap], {
  cwd: monorepoRoot,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
