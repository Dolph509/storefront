import { describe, expect, it } from "vitest";
import { themeGroupHasContent, themeTemplateHasSellerMain } from "./resolver";

describe("themeGroupHasContent", () => {
  it("is false for empty groups", () => {
    expect(themeGroupHasContent(undefined)).toBe(false);
    expect(themeGroupHasContent({ order: [] })).toBe(false);
  });

  it("is true when order has sections", () => {
    expect(themeGroupHasContent({ order: ["header-main"] })).toBe(true);
  });
});

describe("themeTemplateHasSellerMain", () => {
  it("is false without a seller_main section", () => {
    expect(themeTemplateHasSellerMain(undefined)).toBe(false);
    expect(
      themeTemplateHasSellerMain({
        order: ["hero"],
        sections: { hero: { type: "hero" } },
      }),
    ).toBe(false);
  });

  it("is true when seller_main is in order", () => {
    expect(
      themeTemplateHasSellerMain({
        order: ["seller-main"],
        sections: { "seller-main": { type: "seller_main" } },
      }),
    ).toBe(true);
  });
});
