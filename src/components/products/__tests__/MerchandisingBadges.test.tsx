import { describe, expect, it } from "vitest";
import {
  type MerchandisingSignal,
  selectMerchandisingReason,
  selectMerchandisingSignals,
} from "../MerchandisingBadges";

const signals: MerchandisingSignal[] = [
  {
    key: "sale",
    label: "20% off",
    priority: 100,
    source: "promotion",
    scope: "global",
    presentation: "commerce_badge",
  },
  {
    key: "low_stock",
    label: "Only 2 left",
    priority: 90,
    source: "inventory",
    scope: "global",
    presentation: "commerce_badge",
  },
  {
    key: "popular_now",
    label: "Popular now",
    priority: 70,
    source: "engagement_24h",
    scope: "global",
    presentation: "marketplace_badge",
  },
  {
    key: "similar_to_favorites",
    label: "Similar to items you saved",
    priority: 65,
    source: "buyer_interest",
    scope: "personalized",
    presentation: "relevance_reason",
  },
];

describe("selectMerchandisingSignals", () => {
  it("respects max badges and commerce priority", () => {
    expect(
      selectMerchandisingSignals({ signals, maxBadges: 2 }).map(
        (signal) => signal.key,
      ),
    ).toEqual(["sale", "low_stock"]);
  });

  it("filters by allowed badge keys", () => {
    expect(
      selectMerchandisingSignals({
        signals,
        maxBadges: 2,
        allowedSignals: ["low_stock", "popular_now"],
      }).map((signal) => signal.key),
    ).toEqual(["low_stock", "popular_now"]);
  });
});

describe("selectMerchandisingReason", () => {
  it("returns at most one relevance reason", () => {
    expect(selectMerchandisingReason({ signals })?.key).toBe(
      "similar_to_favorites",
    );
  });
});
