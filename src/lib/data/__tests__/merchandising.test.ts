import type { StoreMerchandisingPlacement } from "@spree/sdk";
import { describe, expect, it } from "vitest";
import {
  firstPlacementOfKind,
  placementsOfKind,
} from "@/lib/merchandising-placements";

function placement(
  overrides: Partial<StoreMerchandisingPlacement>,
): StoreMerchandisingPlacement {
  return {
    id: "mplc_1",
    surface: "homepage",
    kind: "hero",
    title: "Live hero",
    body: null,
    cta_label: null,
    cta_url: null,
    position: 0,
    exclusive: true,
    campaign_id: "mcamp_1",
    campaign_name: "Fall Favorites",
    campaign_title: "Fall Favorites",
    heading: "Gifts worth gathering for",
    image_url: null,
    mobile_image_url: null,
    collection_id: null,
    category_id: null,
    products: [],
    sellers: [],
    ...overrides,
  };
}

describe("merchandising placement helpers", () => {
  it("selects the first exclusive hero", () => {
    const placements = [
      placement({ id: "mplc_hero", kind: "hero", title: "Live hero" }),
      placement({
        id: "mplc_rail",
        kind: "product_rail",
        exclusive: false,
        title: "Personalized",
      }),
    ];

    expect(firstPlacementOfKind(placements, "hero")?.title).toBe("Live hero");
    expect(placementsOfKind(placements, "product_rail")).toHaveLength(1);
  });

  it("ignores scheduled kinds that never arrived in the public payload", () => {
    const placements = [
      placement({ id: "mplc_hero", kind: "hero", title: "Live hero" }),
    ];

    expect(firstPlacementOfKind(placements, "hero")?.title).not.toBe(
      "Holiday Preview",
    );
    expect(placements.map((row) => row.title)).not.toContain("Summer Send-off");
  });
});
