import type { Product } from "@spree/sdk";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ThemeBlockRenderer } from "@/components/theme/ThemeBlockRenderer";
import { HiddenPricingProvider } from "@/contexts/HiddenPricingContext";

vi.mock("@/components/products/MediaGallery", () => ({
  MediaGallery: () => <div>Product gallery</div>,
}));
vi.mock("@/components/products/VariantPicker", () => ({
  VariantPicker: () => <div>Variant options</div>,
}));
vi.mock("@/components/reviews/StarRating", () => ({
  StarRatingDisplay: () => <span>Stars</span>,
}));
const { addItem } = vi.hoisted(() => ({ addItem: vi.fn() }));
vi.mock("@/contexts/CartContext", () => ({ useCart: () => ({ addItem }) }));
vi.mock("@/contexts/StoreContext", () => ({
  useStore: () => ({ currency: "USD" }),
}));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));

import { ProductPageBlock } from "./ProductPageBlocks";

const product = {
  id: "prod_1",
  name: "Handmade mug",
  media: [],
  price: { display_amount: "$20", display_compare_at_amount: "$25" },
  original_price: { display_amount: "$25" },
  reviews_count: 4,
  average_rating: 4.5,
  default_variant: { id: "variant_1", sku: "MUG-1", purchasable: true },
  variants: [
    { id: "variant_1", sku: "MUG-1", purchasable: true, option_values: [] },
  ],
  option_types: [{ id: "color", label: "Color" }],
  purchasable: true,
} as unknown as Product;

describe("product page content blocks", () => {
  it("forwards seller-shop discovery through the theme buy button", async () => {
    addItem.mockResolvedValue({ success: true });
    const discovery = {
      source: "seller_shop",
      list_id: "seller-shop-featured",
      position: 2,
      seller_id: "sel_1",
      section: "gifts",
    };

    render(
      <ThemeBlockRenderer
        block={{ type: "buy_buttons", settings: {} }}
        context={{
          kind: "product",
          product,
          basePath: "/us/en",
          locale: "en",
          country: "US",
          cartDiscovery: discovery,
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add to cart" }));
    await waitFor(() =>
      expect(addItem).toHaveBeenCalledWith(
        "variant_1",
        1,
        undefined,
        discovery,
      ),
    );
  });

  it.each([
    ["media", "Product gallery"],
    ["product_title", "Handmade mug"],
    ["product_price", "$20"],
    ["product_rating", "Stars"],
    ["product_variants", "Variant options"],
    ["product_buy_buttons", "Add to cart"],
    ["price", "$20"],
    ["review_stars", "Stars"],
    ["sku", "MUG-1"],
    ["swatches", "Variant options"],
    ["buy_buttons", "Add to cart"],
  ])("renders the %s product block from parent product data", (type, content) => {
    const markup = renderToStaticMarkup(
      <ProductPageBlock type={type} product={product} settings={{}} />,
    );
    expect(markup).toContain(content);
  });

  it("keeps hidden-price storefront rules in configurable price and purchase blocks", () => {
    const markup = renderToStaticMarkup(
      <HiddenPricingProvider value={{ signInHref: "/wholesale/sign-in" }}>
        <>
          <ProductPageBlock type="price" product={product} settings={{}} />
          <ProductPageBlock
            type="buy_buttons"
            product={product}
            settings={{}}
          />
        </>
      </HiddenPricingProvider>,
    );
    expect(markup).toContain("/wholesale/sign-in");
    expect(markup).toContain("hiddenPrice.signInForPricing");
    expect(markup).toContain("hiddenPrice.signInToOrder");
    expect(markup).not.toContain("$20");
  });
});
