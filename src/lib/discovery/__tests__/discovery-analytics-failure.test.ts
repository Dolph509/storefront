import type { Product } from "@spree/sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDiscoveryDedupeCache } from "@/lib/discovery/dedupe";
import { recordDiscoveryClick } from "@/lib/discovery/discovery-analytics";

const recordDiscoveryEventsAction = vi
  .fn()
  .mockRejectedValue(new Error("network"));

vi.mock("@/lib/data/discovery", () => ({
  recordDiscoveryEventsAction: (...args: unknown[]) =>
    recordDiscoveryEventsAction(...args),
}));

const product = { id: "prod_1", default_variant_id: "var_1" } as Product;

describe("discovery analytics failures", () => {
  beforeEach(() => {
    clearDiscoveryDedupeCache();
    recordDiscoveryEventsAction.mockClear();
  });

  it("does not throw when recordEvents fails", () => {
    expect(() =>
      recordDiscoveryClick(product, {
        source: "search",
        searchQueryId: "sqry_1",
        listId: "search-results",
        position: 0,
      }),
    ).not.toThrow();
  });
});
