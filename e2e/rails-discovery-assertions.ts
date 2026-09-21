import { spawnSync } from "node:child_process";

const DOCKER_CONTAINER =
  process.env.SPREE_E2E_DOCKER_CONTAINER || "server-web-1";
const RAILS_DIR = process.env.SPREE_E2E_RAILS_DIR || "/rails";

type LineItemAttribution = {
  found: boolean;
  attributed?: boolean;
  reason?: string;
  order_number?: string;
  seller_slug?: string;
  sku?: string;
  source_type?: string;
  search_query_id?: string | null;
  search_query?: string | null;
  list_id?: string | null;
  position?: number | null;
  campaign_id?: string | null;
  placement_id?: string | null;
  recommendation_type?: string | null;
};

type DiscoveryEventsSummary = {
  total: number;
  impressions: number;
  clicks: number;
  add_to_carts: number;
};

type AttributionCoverage = {
  completed_seller_lines: number;
  attributed_lines: number;
  coverage_percent: number;
};

function runE2eAction(
  action: string,
  env: Record<string, string>,
): Record<string, unknown> {
  const args = [
    "exec",
    "-e",
    "MARKETPLACE_E2E_REQUIRED=1",
    "-e",
    `E2E_ACTION=${action}`,
    ...Object.entries(env).flatMap(([key, value]) => ["-e", `${key}=${value}`]),
    DOCKER_CONTAINER,
    "bash",
    "-lc",
    `cd ${RAILS_DIR} && bin/rails spree:marketplace:e2e_discovery`,
  ];

  const result = spawnSync("docker", args, { encoding: "utf8" });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "docker exec failed");
  }
  const stdout = result.stdout;
  const line = stdout.trim().split("\n").pop() ?? "{}";
  return JSON.parse(line) as Record<string, unknown>;
}

export function fetchLineItemAttribution(options: {
  buyerEmail: string;
  sku: string;
  orderNumber?: string;
  completedOnly?: boolean;
}): LineItemAttribution {
  const env: Record<string, string> = {
    BUYER_EMAIL: options.buyerEmail,
    SKU: options.sku,
    COMPLETED_ONLY: options.completedOnly === false ? "0" : "1",
  };
  if (options.orderNumber) {
    env.ORDER_NUMBER = options.orderNumber;
  }
  return runE2eAction("line_item_attribution", env) as LineItemAttribution;
}

export function fetchDiscoveryEventsForSession(
  sessionKey: string,
): DiscoveryEventsSummary {
  return runE2eAction("discovery_events_for_session", {
    SESSION_KEY: sessionKey,
  }) as DiscoveryEventsSummary;
}

export function fetchAttributionCoverage(
  sinceIso?: string,
): AttributionCoverage {
  const env: Record<string, string> = {};
  if (sinceIso) {
    env.SINCE = sinceIso;
  }
  return runE2eAction("attribution_coverage", env) as AttributionCoverage;
}

export function fetchHistoricalUnattributed(): {
  unattributed_completed_lines: number;
  sample: Array<{ order_number: string; sku: string }>;
} {
  return runE2eAction("historical_unattributed", {}) as {
    unattributed_completed_lines: number;
    sample: Array<{ order_number: string; sku: string }>;
  };
}
