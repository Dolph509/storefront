import { describe, expect, it } from "vitest";
import { toCartDiscoveryPayload } from "@/lib/discovery/cart-payload";

describe("toCartDiscoveryPayload", () => {
  it("maps discovery context to Store API shape", () => {
    const payload = toCartDiscoveryPayload(
      {
        source: "search",
        searchQueryId: "sqry_abc",
        listId: "search-results",
        position: 1,
      },
      "guest-session",
    );

    expect(payload).toEqual({
      source_type: "search",
      search_query_id: "sqry_abc",
      list_id: "search-results",
      position: 1,
      session_key: "guest-session",
    });
  });
});
