import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  resetRecommendationAttributionDedupeForTests,
  trackRecommendationClick,
} from "@/lib/analytics/recommendation-attribution";
import {
  inferRecommendationSurfaceFromListId,
  isOrganicRecommendationListId,
  isPrimaryOrganicNavigationClick,
  recommendationClickFromHref,
  recordRecommendationProductClick,
} from "@/lib/analytics/recommendation-click";
import * as beacon from "@/lib/analytics/recommendation-metrics-beacon";

vi.mock("@/lib/analytics/recommendation-metrics-beacon", () => ({
  sendRecommendationMetricEvents: vi.fn(),
}));

function primaryClick(
  overrides: Partial<{
    button: number;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    defaultPrevented: boolean;
  }> = {},
) {
  return {
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    defaultPrevented: false,
    ...overrides,
  };
}

describe("isOrganicRecommendationListId", () => {
  it("recognizes discovery and recommendation list ids", () => {
    expect(isOrganicRecommendationListId("recommendation-for-you")).toBe(true);
    expect(isOrganicRecommendationListId("category-discovery-cat_1")).toBe(
      true,
    );
    expect(isOrganicRecommendationListId("cart:recommended")).toBe(true);
    expect(isOrganicRecommendationListId("account-for-you")).toBe(true);
    expect(isOrganicRecommendationListId("merchandising-pl_1")).toBe(false);
    expect(isOrganicRecommendationListId("category-cat_1")).toBe(false);
  });
});

describe("recommendationClickFromHref", () => {
  it("parses marketplace discovery params", () => {
    const context = recommendationClickFromHref(
      "/us/en/products/vase?src=marketplace&list_id=cart%3Arecommended&pos=2",
    );
    expect(context).toEqual({
      surface: "cart",
      listId: "cart:recommended",
      position: 3,
    });
  });

  it("ignores non-discovery links", () => {
    expect(
      recommendationClickFromHref(
        "/us/en/products/vase?src=search&query_id=q_1",
      ),
    ).toBeNull();
  });
});

describe("inferRecommendationSurfaceFromListId", () => {
  it("maps surfaces for reporting", () => {
    expect(inferRecommendationSurfaceFromListId("recommendation-similar")).toBe(
      "pdp",
    );
    expect(inferRecommendationSurfaceFromListId("collection-discovery-x")).toBe(
      "collection",
    );
  });
});

describe("recordRecommendationProductClick", () => {
  beforeEach(() => {
    resetRecommendationAttributionDedupeForTests();
    vi.mocked(beacon.sendRecommendationMetricEvents).mockClear();
    window.dataLayer = [];
  });

  it("records one organic click for a primary navigation", () => {
    recordRecommendationProductClick(primaryClick(), {
      productId: "prod_1",
      context: {
        surface: "home_rail",
        listId: "recommendation-for-you",
        personalized: true,
        position: 1,
      },
    });

    expect(beacon.sendRecommendationMetricEvents).toHaveBeenCalledTimes(1);
    expect(beacon.sendRecommendationMetricEvents).toHaveBeenCalledWith([
      expect.objectContaining({
        kind: "click",
        product_id: "prod_1",
        list_id: "recommendation-for-you",
        surface: "home_rail",
      }),
    ]);
  });

  it("does not record modified or non-primary clicks", () => {
    recordRecommendationProductClick(primaryClick({ metaKey: true }), {
      productId: "prod_1",
      context: { surface: "cart", listId: "cart:related" },
    });
    recordRecommendationProductClick(primaryClick({ button: 1 }), {
      productId: "prod_1",
      context: { surface: "cart", listId: "cart:related" },
    });
    expect(beacon.sendRecommendationMetricEvents).not.toHaveBeenCalled();
  });

  it("dedupes duplicate click tracking in the same session", () => {
    const context = { surface: "pdp", listId: "recommendation-similar" };
    recordRecommendationProductClick(primaryClick(), {
      productId: "prod_1",
      context,
    });
    recordRecommendationProductClick(primaryClick(), {
      productId: "prod_1",
      context,
    });
    expect(beacon.sendRecommendationMetricEvents).toHaveBeenCalledTimes(1);
  });

  it("preserves surface attribution per list id", () => {
    for (const [listId, surface] of [
      ["account-for-you", "account"],
      ["favorites-discovery", "favorites"],
      ["seller-discovery-shop", "seller_shop"],
    ] as const) {
      resetRecommendationAttributionDedupeForTests();
      vi.mocked(beacon.sendRecommendationMetricEvents).mockClear();
      recordRecommendationProductClick(primaryClick(), {
        productId: "prod_x",
        context: { surface, listId },
      });
      expect(beacon.sendRecommendationMetricEvents).toHaveBeenCalledWith([
        expect.objectContaining({ surface, list_id: listId }),
      ]);
    }
  });
});

describe("isPrimaryOrganicNavigationClick", () => {
  it("allows keyboard-equivalent primary activation", () => {
    expect(isPrimaryOrganicNavigationClick(primaryClick())).toBe(true);
    expect(
      isPrimaryOrganicNavigationClick(primaryClick({ ctrlKey: true })),
    ).toBe(false);
  });
});

describe("trackRecommendationClick", () => {
  beforeEach(() => {
    resetRecommendationAttributionDedupeForTests();
    vi.mocked(beacon.sendRecommendationMetricEvents).mockClear();
  });

  it("sends click events to the Rails metrics beacon", () => {
    trackRecommendationClick({
      productId: "prod_abc",
      surface: "category",
      listId: "category-discovery-cat_1",
      personalized: false,
      position: 4,
    });
    expect(beacon.sendRecommendationMetricEvents).toHaveBeenCalledWith([
      {
        kind: "click",
        surface: "category",
        list_id: "category-discovery-cat_1",
        product_id: "prod_abc",
        personalized: false,
        experiment_variant: undefined,
        position: 4,
      },
    ]);
  });
});
