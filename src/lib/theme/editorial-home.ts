import type { ThemeTemplateDocument } from "@spree/sdk";

const media = "/marketplace/";

export interface EditorialHomeCopy {
  heroEyebrow: string;
  heroHeading: string;
  heroSubheading: string;
  heroCta: string;
  categoriesHeading: string;
  productsHeading: string;
  productsSubheading: string;
  collectionsHeading: string;
  giftsEyebrow: string;
  giftsHeading: string;
  giftsBody: string;
  giftsCta: string;
  storyEyebrow: string;
  storyHeading: string;
  storyBody: string;
  storyCta: string;
  shopsHeading: string;
  trustHeading: string;
  makerTrustTitle: string;
  makerTrustBody: string;
  giftTrustTitle: string;
  giftTrustBody: string;
  messageTrustTitle: string;
  messageTrustBody: string;
}

export function editorialHomeDocument(
  basePath: string,
  copy: EditorialHomeCopy,
): ThemeTemplateDocument {
  const sections = {
    editorial_campaign: {
      type: "hero",
      settings: {
        editorial_presentation: true,
        eyebrow: copy.heroEyebrow,
        heading: copy.heroHeading,
        subheading: copy.heroSubheading,
        image_url: `${media}artisan-home-hero-v2.png`,
        button_text: copy.heroCta,
        button_link: `${basePath}/products?q=gift`,
        background_color: "palette",
        padding_top: 32,
        padding_bottom: 32,
      },
    },
    editorial_categories: {
      type: "category_tiles",
      settings: {
        editorial_presentation: true,
        heading: copy.categoriesHeading,
        source: "all",
        limit: 6,
        columns_desktop: 6,
        columns_tablet: 3,
        columns_mobile: 2,
        grid_gap: 20,
        grid_gap_mobile: 14,
        image_ratio: "square",
        image_zoom_on_hover: true,
        padding_top: 40,
        padding_bottom: 56,
        padding_top_mobile: 40,
        padding_bottom_mobile: 42,
      },
    },
    editorial_products: {
      type: "product_rail",
      settings: {
        editorial_presentation: true,
        heading: copy.productsHeading,
        subheading: copy.productsSubheading,
        source: "all",
        strategy: "newest",
        layout: "grid",
        columns: 4,
        gap: 20,
        limit: 8,
        padding_top: 56,
        padding_bottom: 56,
        background_color: "#f8f5ef",
      },
    },
    editorial_collections: {
      type: "collection_tiles",
      settings: {
        editorial_presentation: true,
        heading: copy.collectionsHeading,
        source: "placement",
        layout: "below",
        limit: 3,
        columns_desktop: 3,
        columns_tablet: 3,
        columns_mobile: 1,
        grid_gap: 24,
        grid_gap_mobile: 20,
        image_ratio: "landscape",
        image_zoom_on_hover: true,
        padding_top: 64,
        padding_bottom: 64,
        padding_top_mobile: 42,
        padding_bottom_mobile: 42,
      },
    },
    editorial_gifts: {
      type: "editorial",
      settings: {
        editorial_presentation: true,
        eyebrow: copy.giftsEyebrow,
        heading: copy.giftsHeading,
        body: copy.giftsBody,
        image_url: `${media}thoughtful-gift.png`,
        image_position: "right",
        button_text: copy.giftsCta,
        button_link: `${basePath}/products?q=personalized`,
        background_color: "palette",
        padding_top: 32,
        padding_bottom: 32,
      },
    },
    editorial_story: {
      type: "editorial",
      settings: {
        editorial_presentation: true,
        eyebrow: copy.storyEyebrow,
        heading: copy.storyHeading,
        body: copy.storyBody,
        image_url: `${media}maker-story.png`,
        image_position: "left",
        button_text: copy.storyCta,
        button_link: `${basePath}/shops`,
        background_color: "#e4e8dd",
        padding_top: 24,
        padding_bottom: 24,
        gap: 0,
      },
    },
    editorial_shops: {
      type: "shop_rail",
      settings: {
        editorial_presentation: true,
        heading: copy.shopsHeading,
        source: "highest_rated",
        limit: 3,
        columns_desktop: 3,
        columns_tablet: 2,
        columns_mobile: 1,
        show_arrows_mobile: true,
        padding_top: 40,
        padding_bottom: 40,
      },
    },
    editorial_difference: {
      type: "text_with_icons",
      settings: {
        editorial_presentation: true,
        heading: copy.trustHeading,
        alignment: "center",
        columns: 3,
        padding_top: 56,
        padding_bottom: 56,
        background_color: "#f8f5ef",
        items: `${copy.makerTrustTitle}|${copy.makerTrustBody}\n${copy.giftTrustTitle}|${copy.giftTrustBody}\n${copy.messageTrustTitle}|${copy.messageTrustBody}`,
      },
    },
  };

  return { sections, order: Object.keys(sections) };
}
