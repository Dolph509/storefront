import { describe, expect, it } from "vitest";
import { productTemplateDiscoverySkip } from "@/lib/theme/product-discovery-skip";

describe("productTemplateDiscoverySkip", () => {
  it("skips footer more-from-shop when the template already has that section", () => {
    const skip = productTemplateDiscoverySkip({
      order: ["main", "shop"],
      sections: {
        main: { type: "product" },
        shop: { type: "more_from_shop" },
      },
    });

    expect(skip.moreFromShop).toBe(true);
    expect(skip.similar).toBe(false);
  });

  it("does not skip footer rails when only the document product section is present", () => {
    const skip = productTemplateDiscoverySkip({
      order: ["main"],
      sections: {
        main: { type: "product" },
      },
    });

    expect(skip.moreFromShop).toBe(false);
    expect(skip.similar).toBe(false);
  });
});
