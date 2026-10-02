import type { Product } from "@spree/sdk";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PRODUCT_PAGE_EXPAND } from "@/lib/data/cached";
import { ProductDetails } from "./ProductDetails";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/products/MediaGallery", () => ({
  MediaGallery: () => null,
}));

vi.mock("@/components/products/FavoriteButton", () => ({
  FavoriteButton: () => null,
}));

vi.mock("@/components/products/ProductCustomFields", () => ({
  ProductCustomFields: () => null,
}));

vi.mock("@/components/cart/QuantityPickerField", () => ({
  QuantityPickerField: () => <div data-testid="quantity-picker" />,
}));

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ addItem: vi.fn() }),
}));

vi.mock("@/contexts/HiddenPricingContext", () => ({
  useHiddenPricing: () => null,
}));

vi.mock("@/contexts/StoreContext", () => ({
  useStore: () => ({ currency: "USD" }),
}));

vi.mock("@/lib/analytics/gtm", () => ({
  trackAddToCart: vi.fn(),
  trackViewItem: vi.fn(),
}));

const productWithoutCustomVariants = {
  id: "product-1",
  name: "Single Variant Product",
  slug: "single-variant-product",
  default_variant_id: "variant-master",
  default_variant: {
    id: "variant-master",
    product_id: "product-1",
    sku: "MASTER-SKU-001",
    options_text: "",
    purchasable: true,
    in_stock: true,
    price: {
      display_amount: "$25.00",
      amount_in_cents: 2500,
      compare_at_amount_in_cents: null,
      display_compare_at_amount: null,
    },
    original_price: null,
  },
  variants: [],
  option_types: [],
  media: [],
  purchasable: true,
  in_stock: true,
  price: {
    display_amount: "$25.00",
    amount_in_cents: 2500,
    compare_at_amount_in_cents: null,
    display_compare_at_amount: null,
  },
  original_price: null,
  description_html: null,
  custom_fields: [],
} as unknown as Product;

describe("ProductDetails", () => {
  it("requests the default variant for the product page", () => {
    expect(PRODUCT_PAGE_EXPAND).toContain("default_variant");
  });

  it("shows the master SKU when a product has no custom variants", () => {
    render(
      <ProductDetails
        product={productWithoutCustomVariants}
        basePath="/us/en"
      />,
    );

    expect(screen.getByText("sku")).toBeInTheDocument();
    expect(screen.getByText("MASTER-SKU-001")).toBeInTheDocument();
  });

  it("keeps private custom listings at the server-enforced quantity of one", () => {
    render(
      <ProductDetails
        product={productWithoutCustomVariants}
        basePath="/us/en"
        fixedQuantity
      />,
    );

    expect(screen.queryByTestId("quantity-picker")).not.toBeInTheDocument();
  });

  it("uses the configured product block order instead of the built-in detail column", () => {
    const product = {
      ...productWithoutCustomVariants,
      seller: { name: "Maker Shop", slug: "maker-shop" },
      description_html: "<p>Made by hand.</p>",
    } as Product;
    render(
      <ProductDetails
        product={product}
        basePath="/us/en"
        templateBlocks={[
          <p key="price" data-testid="configured-price">
            Configured price
          </p>,
          <h1 key="title">Configured title</h1>,
        ]}
        templateDescriptionBlockPresent
        templateMediaSettings={{ aspect_ratio: "square" }}
      />,
    );

    const content = screen.getByTestId("configured-price").parentElement;
    expect(content).toHaveAttribute("data-theme-product-block-layout");
    expect(content?.textContent?.indexOf("Configured price")).toBeLessThan(
      content?.textContent?.indexOf("Configured title") ?? -1,
    );
    expect(
      screen.getByRole("heading", { name: "Configured title" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("heading", { name: "Single Variant Product" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Maker Shop/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Made by hand.")).not.toBeInTheDocument();
  });

  it("does not duplicate description when description tabs are configured as a block", () => {
    const product = {
      ...productWithoutCustomVariants,
      description_html: "<p>Made by hand.</p>",
    } as Product;
    render(
      <ProductDetails
        product={product}
        basePath="/us/en"
        templateBlocks={[
          <div key="description-tabs">Configured description tabs</div>,
        ]}
        templateDescriptionBlockPresent
      />,
    );
    expect(screen.getByText("Configured description tabs")).toBeVisible();
    expect(screen.queryByText("Made by hand.")).not.toBeInTheDocument();
  });

  it("renders previous and next products when product navigation is enabled", () => {
    render(
      <ProductDetails
        product={productWithoutCustomVariants}
        basePath="/us/en"
        appearance={{ product_navigation: true }}
        productNavigation={{
          previous: { name: "Earlier item", slug: "earlier-item" },
          next: { name: "Later item", slug: "later-item" },
        }}
      />,
    );

    expect(
      screen.getByRole("navigation", { name: "Product navigation" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Earlier item/ })).toHaveAttribute(
      "href",
      "/us/en/products/earlier-item",
    );
    expect(screen.getByRole("link", { name: /Later item/ })).toHaveAttribute(
      "href",
      "/us/en/products/later-item",
    );
  });

  it("honors serialized false values for product page controls", () => {
    const product = {
      ...productWithoutCustomVariants,
      seller: { name: "Maker Shop", slug: "maker-shop", reviews_count: 0 },
      reviews_count: 5,
      average_rating: 4.8,
    } as Product;

    render(
      <ProductDetails
        product={product}
        basePath="/us/en"
        appearance={{ show_vendor: "false" }}
        globalSettings={{ show_reviews: "false" }}
      />,
    );

    expect(screen.queryByText("soldBy")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /reviewCount/ }),
    ).not.toBeInTheDocument();
  });
});
