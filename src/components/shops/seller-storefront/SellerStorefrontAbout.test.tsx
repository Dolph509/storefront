import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl/server", () => ({
  getTranslations:
    async () =>
    (key: string, values?: { name?: string; marketplace?: string }) =>
      key === "aboutShopHeading"
        ? `About ${values?.name}`
        : key === "aboutOnMarketplaceLabel"
          ? `On ${values?.marketplace} since`
          : key,
}));

import { SellerStorefrontAbout } from "./SellerStorefrontAbout";

describe("SellerStorefrontAbout", () => {
  it("shows editable empty sections in the shop editor preview", async () => {
    const html = renderToStaticMarkup(
      await SellerStorefrontAbout({
        shopName: "Test shop",
        marketplaceName: "Spree",
        editorPreview: true,
        shopPage: {
          story_headline: null,
          video_url: null,
          video_captions_url: null,
          photos: [],
          links: [],
          member_bios: [],
          faqs: [],
          seller_details_public: false,
          seller_details: {},
        },
      }),
    );

    expect(html).toContain("Shop photos and video");
    expect(html).toContain("Add a shop link");
    expect(html).toContain("Shop members");
    expect(html).toContain("Frequently asked questions");
    expect(html).toContain("Seller details");
    expect(html).toContain("Edit seller details");
  });

  it("keeps empty optional sections hidden from public shop pages", async () => {
    const html = renderToStaticMarkup(
      await SellerStorefrontAbout({
        shopName: "Test shop",
        marketplaceName: "Spree",
        shopPage: {
          story_headline: null,
          video_url: null,
          video_captions_url: null,
          photos: [],
          links: [],
          member_bios: [],
          faqs: [],
          seller_details_public: false,
          seller_details: {},
        },
      }),
    );

    expect(html).not.toContain("Shop photos and video");
    expect(html).not.toContain("Shop members");
    expect(html).not.toContain("Frequently asked questions");
    expect(html).not.toContain("Seller details");
  });
});
