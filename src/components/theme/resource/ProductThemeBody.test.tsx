import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock(
  "@/app/[country]/[locale]/(storefront)/products/[slug]/ProductDetails",
  () => ({
    ProductDetails: () => <div data-testid="product-details" />,
  }),
);
vi.mock("@/components/navigation/Breadcrumbs", () => ({
  Breadcrumbs: () => null,
}));
vi.mock("@/components/reviews/ProductReviewsSection", () => ({
  ProductReviewsSection: () => <div data-legacy-lower="reviews" />,
}));
vi.mock("@/components/products/ProductPageRecommendations", () => ({
  ProductPageRecommendations: () => <div data-legacy-lower="recommendations" />,
}));
vi.mock("@/components/products/RecentlyViewedProducts", () => ({
  RecentlyViewedProducts: () => <div data-legacy-lower="recently-viewed" />,
}));

import { ProductThemeBody } from "./ProductThemeBody";

describe("ProductThemeBody template ownership", () => {
  const context = {
    kind: "product",
    product: { id: "prod_1", name: "Handmade bowl" },
    basePath: "/us/en",
    locale: "en",
  } as never;

  it("leaves lower sections to the document for granular product templates", async () => {
    const html = renderToStaticMarkup(
      await ProductThemeBody({ context, documentDriven: true }),
    );
    expect(html).toContain('data-testid="product-details"');
    expect(html).not.toContain("data-legacy-lower=");
  });

  it("keeps lower-section fallback for legacy product templates", async () => {
    const html = renderToStaticMarkup(
      await ProductThemeBody({
        context,
        documentDriven: false,
        themeSettings: { product_page: { show_recently_viewed: true } },
      }),
    );
    expect(html).toContain('data-legacy-lower="reviews"');
    expect(html).toContain('data-legacy-lower="recommendations"');
    expect(html).toContain('data-legacy-lower="recently-viewed"');
  });
});
