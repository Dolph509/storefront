import type { ThemeTemplateDocument } from "@spree/sdk";
import { themeSettingEnabled } from "@/lib/theme/setting-value";

export type ProductPageDiscoverySkip = {
  moreFromShop?: boolean;
  similar?: boolean;
  recentlyViewed?: boolean;
};

function sectionType(
  sections: ThemeTemplateDocument["sections"],
  sectionId: string,
): string {
  return sections?.[sectionId]?.type ?? "";
}

/** Sections already rendered by explicit CMS blocks in the product template. */
export function productTemplateDiscoverySkip(
  data: ThemeTemplateDocument,
  productPageSettings?: Record<string, string | boolean>,
): ProductPageDiscoverySkip {
  const sections = data.sections || {};
  const order = data.order || [];

  return {
    moreFromShop: order.some((id) =>
      ["related_products", "more_from_shop"].includes(
        sectionType(sections, id),
      ),
    ),
    similar: order.some((id) =>
      ["recommended_products", "product_recommendations"].includes(
        sectionType(sections, id),
      ),
    ),
    recentlyViewed: order.some(
      (id) => sectionType(sections, id) === "recently_viewed_products",
    ),
  };
}
