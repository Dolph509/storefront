/**
 * Run merchandising E2E backend helpers (Docker exec or localhost HTTP).
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { postMerchDev } from "./merch-e2e-http.mjs";

const storefrontRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const monorepoRoot = resolve(storefrontRoot, "..");

const LOCALHOST_ACTIONS = {
  'Spree::MarketplaceDevDataset::MerchandisingSignalsFixtures.new(store: Spree::Store.default).enable_top_shop!':
    "enable_top_shop",
  "Spree::Store.default.update!(preferred_merchandising_top_shop_enabled: false)":
    "disable_top_shop",
};

export async function runMerchRailsRunner(ruby, options = {}) {
  const localhost = process.env.MERCH_E2E_LOCALHOST === "1";

  if (localhost) {
    const action = LOCALHOST_ACTIONS[ruby.trim()];
    if (action) {
      await postMerchDev(action);
      return { status: 0 };
    }

    const serverDir =
      process.env.MERCH_E2E_SERVER_DIR || join(monorepoRoot, "server");
    const runnerScript = join(monorepoRoot, "scripts", "merch-rails-runner.rb");
    const bundle = process.platform === "win32" ? "bundle.bat" : "bundle";
    if (!existsSync(serverDir) || !existsSync(runnerScript)) {
      throw new Error(
        `Local merchandising runner missing (server=${serverDir}, script=${runnerScript}).`,
      );
    }
    return spawnSync(bundle, ["exec", "ruby", runnerScript, ruby], {
      cwd: serverDir,
      stdio: options.stdio || "inherit",
      env: {
        ...process.env,
        BUNDLE_GEMFILE: join(serverDir, "Gemfile"),
        SPREE_PATH: monorepoRoot,
      },
    });
  }

  const composeFile = "e2e-backend/docker-compose.merchandising.yml";
  const escaped = ruby.replace(/"/g, '\\"');
  return spawnSync(
    "docker",
    [
      "compose",
      "-f",
      composeFile,
      "exec",
      "-T",
      "web",
      "bash",
      "-lc",
      `cd /rails && bundle exec rails runner "${escaped}"`,
    ],
    {
      cwd: storefrontRoot,
      stdio: options.stdio || "inherit",
      shell: process.platform === "win32",
    },
  );
}
