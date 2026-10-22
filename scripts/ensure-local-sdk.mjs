import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(fileURLToPath(import.meta.url));
const storefrontRoot = resolve(root, "..");
const sdkPath = resolve(storefrontRoot, "..", "packages", "sdk");

if (!existsSync(resolve(sdkPath, "package.json"))) {
  console.log("ensure-local-sdk: no monorepo SDK path; skipping");
  process.exit(0);
}

const result = spawnSync("pnpm", ["build"], {
  cwd: sdkPath,
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
