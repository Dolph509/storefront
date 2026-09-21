import { describe, expect, it } from "vitest";
import { buildDiscoveryContext } from "@/lib/discovery/list-context";

describe("buildDiscoveryContext", () => {
  it("maps search results with query id", () => {
    const ctx = buildDiscoveryContext(
      {
        listId: "search-results",
        searchQueryId: "sqry_abc",
      },
      2,
    );
    expect(ctx.source).toBe("search");
    expect(ctx.searchQueryId).toBe("sqry_abc");
    expect(ctx.position).toBe(2);
  });

  it("maps recommendation trending list id", () => {
    const ctx = buildDiscoveryContext({ listId: "recommendation-trending" }, 0);
    expect(ctx.source).toBe("recommendation_trending");
    expect(ctx.recommendationType).toBe("trending");
  });

  it("maps merchandising placement", () => {
    const ctx = buildDiscoveryContext({
      listId: "merchandising-mplc_1",
      campaignId: "mcamp_1",
      placementId: "mplc_1",
    });
    expect(ctx.source).toBe("merchandising");
    expect(ctx.campaignId).toBe("mcamp_1");
    expect(ctx.placementId).toBe("mplc_1");
  });
});
