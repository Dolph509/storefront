import { describe, expect, it } from "vitest";
import {
  clearDiscoveryDedupeCache,
  discoveryDedupeKey,
  shouldEmitDiscoveryEvent,
} from "@/lib/discovery/dedupe";

describe("discovery dedupe", () => {
  it("dedupes identical impression keys", () => {
    clearDiscoveryDedupeCache();
    const key = discoveryDedupeKey(
      "impression",
      "prod_1",
      { source: "search", searchQueryId: "sqry_1", listId: "search-results" },
      "page-1",
    );
    expect(shouldEmitDiscoveryEvent(key)).toBe(true);
    expect(shouldEmitDiscoveryEvent(key)).toBe(false);
  });
});
