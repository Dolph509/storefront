import type { Product } from "@spree/sdk";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FeaturedCollectionProductCard } from "@/components/products/FeaturedCollectionProductCard";
import { ThemeSettingsProvider } from "@/contexts/ThemeSettingsContext";

vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));

vi.mock("@/components/products/FavoriteButton", () => ({
  FavoriteButton: () => <button type="button" aria-label="addFavorite" />,
}));

vi.mock("@/components/products/FeaturedCollectionQuickAdd", () => ({
  FeaturedCollectionQuickAdd: () => <button type="button">Quick add</button>,
}));

const product = {
  id: "prod-1",
  name: "Sale T-Shirt",
  slug: "sale-t-shirt",
  purchasable: true,
  thumbnail_url: "https://example.com/shirt.jpg",
  price: { display_amount: "$15.00" },
  original_price: { display_amount: "$25.00" },
  average_rating: 4.5,
  reviews_count: 12,
  default_variant: { sku: "TSHIRT-01" },
  option_values: [
    {
      id: "color-1",
      color_code: "#ff0000",
      option_type_label: "Color",
      label: "Red",
    },
  ],
} as unknown as Product;

describe("FeaturedCollectionProductCard", () => {
  it("applies product-card, media, title, and price settings", () => {
    const { container } = render(
      <FeaturedCollectionProductCard
        product={product}
        basePath="/en/us"
        quickAdd={false}
        mobileQuickAdd={false}
        parts={[
          {
            type: "product_card",
            settings: {
              background_color: "#f0f0f0",
              border_style: "solid",
              corner_radius: 12,
              vertical_gap: 8,
              padding_left: 6,
            },
          },
          {
            type: "media",
            settings: { aspect_ratio: "square", corner_radius: 8 },
          },
          {
            type: "product_title",
            settings: {
              preset: "heading_4",
              alignment: "center",
              text_color: "#123456",
              padding_top: 5,
            },
          },
          {
            type: "price",
            settings: {
              preset: "heading_5",
              alignment: "right",
              show_sale_first: true,
            },
          },
        ]}
      />,
    );

    const card = container.querySelector("article");
    expect(card).toHaveStyle({
      backgroundColor: "rgb(240, 240, 240)",
      borderRadius: "12px",
      paddingLeft: "6px",
      rowGap: "8px",
    });
    expect(container.querySelector("a.relative")).toHaveClass("aspect-square");
    expect(screen.getByRole("heading", { name: "Sale T-Shirt" })).toHaveStyle({
      textAlign: "center",
      color: "rgb(18, 52, 86)",
      paddingTop: "5px",
    });
    expect(
      screen
        .getByText("$15.00")
        .compareDocumentPosition(screen.getByText("$25.00")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders installment and tax information and applies global currency formatting", () => {
    render(
      <ThemeSettingsProvider
        settings={{ localization: { currency_format: "with_currency" } }}
      >
        <FeaturedCollectionProductCard
          product={product}
          basePath="/en/us"
          currency="USD"
          quickAdd={false}
          mobileQuickAdd={false}
          parts={[
            { type: "media", settings: {} },
            { type: "product_title", settings: {} },
            {
              type: "price",
              settings: { installments: true, tax_information: true },
            },
          ]}
        />
      </ThemeSettingsProvider>,
    );

    expect(screen.getByText("$15.00 USD")).toBeInTheDocument();
    expect(
      screen.getByText("installmentOptionsAtCheckout"),
    ).toBeInTheDocument();
    expect(screen.getByText("taxesCalculatedAtCheckout")).toBeInTheDocument();
  });

  it("renders the optional product card review, SKU, swatch, and buy button blocks", () => {
    render(
      <FeaturedCollectionProductCard
        product={product}
        basePath="/en/us"
        quickAdd={false}
        mobileQuickAdd={false}
        parts={[
          { type: "product_title", settings: {} },
          { type: "review_stars", settings: { show_count: true } },
          { type: "sku", settings: { label: "SKU" } },
          { type: "swatches", settings: { label: "Color" } },
          { type: "buy_buttons", settings: { quick_add: true } },
        ]}
      />,
    );

    expect(screen.getByLabelText("4.5 out of 5 stars")).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveTextContent("4.5 (12)");
    expect(screen.getByText("SKU TSHIRT-01")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Color" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Quick add" }),
    ).toBeInTheDocument();
  });

  it("lets the buy buttons block hide quick add even when the section enables it", () => {
    render(
      <FeaturedCollectionProductCard
        product={product}
        basePath="/en/us"
        quickAdd
        mobileQuickAdd={false}
        parts={[
          { type: "media", settings: {} },
          { type: "product_title", settings: {} },
          { type: "buy_buttons", settings: { quick_add: false } },
        ]}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Quick add" }),
    ).not.toBeInTheDocument();
  });

  it("shows the second product image when the section hover setting is enabled", () => {
    const productWithMedia = {
      ...product,
      media: [
        {
          media_type: "image",
          original_url: "https://example.com/alternate.jpg",
          small_url: "https://example.com/alternate-small.jpg",
        },
      ],
    } as unknown as Product;
    const { container } = render(
      <FeaturedCollectionProductCard
        product={productWithMedia}
        basePath="/en/us"
        quickAdd={false}
        mobileQuickAdd={false}
        showSecondImageOnHover
        parts={[{ type: "media", settings: {} }]}
      />,
    );

    expect(
      container.querySelector(
        'img[src="https://example.com/alternate-small.jpg"]',
      ),
    ).toBeInTheDocument();
  });

  it("respects global product grid vendor and favorite visibility settings", () => {
    const productWithSeller = {
      ...product,
      seller_name: "Maker Studio",
      seller_slug: "maker-studio",
    } as unknown as Product;
    render(
      <ThemeSettingsProvider
        settings={{
          products_grid: { show_vendor: "false", show_favorites: "false" },
        }}
      >
        <FeaturedCollectionProductCard
          product={productWithSeller}
          basePath="/en/us"
          quickAdd={false}
          mobileQuickAdd={false}
          parts={[
            { type: "media", settings: {} },
            { type: "product_title", settings: {} },
          ]}
        />
      </ThemeSettingsProvider>,
    );

    expect(screen.queryByText("Maker Studio")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "addFavorite" }),
    ).not.toBeInTheDocument();
  });

  it("uses global quick add unless the product card buy-buttons block overrides it", () => {
    const { rerender } = render(
      <ThemeSettingsProvider
        settings={{ products_grid: { show_quick_add: "true" } }}
      >
        <FeaturedCollectionProductCard
          product={product}
          basePath="/en/us"
          quickAdd={false}
          mobileQuickAdd={false}
          parts={[
            { type: "media", settings: {} },
            { type: "product_title", settings: {} },
          ]}
        />
      </ThemeSettingsProvider>,
    );
    expect(
      screen.getByRole("button", { name: "Quick add" }),
    ).toBeInTheDocument();

    rerender(
      <ThemeSettingsProvider
        settings={{ products_grid: { show_quick_add: "true" } }}
      >
        <FeaturedCollectionProductCard
          product={product}
          basePath="/en/us"
          quickAdd={false}
          mobileQuickAdd={false}
          parts={[
            { type: "media", settings: {} },
            { type: "product_title", settings: {} },
            { type: "buy_buttons", settings: { quick_add: false } },
          ]}
        />
      </ThemeSettingsProvider>,
    );
    expect(
      screen.queryByRole("button", { name: "Quick add" }),
    ).not.toBeInTheDocument();
  });

  it("uses the global product swatch option, style, and size", () => {
    render(
      <ThemeSettingsProvider
        settings={{
          product_swatches: {
            enabled: "true",
            option_name: "Color",
            color_style: "label",
            size: "large",
          },
        }}
      >
        <FeaturedCollectionProductCard
          product={product}
          basePath="/en/us"
          quickAdd={false}
          mobileQuickAdd={false}
          parts={[
            { type: "media", settings: {} },
            { type: "product_title", settings: {} },
          ]}
        />
      </ThemeSettingsProvider>,
    );

    expect(
      screen.getByRole("list", { name: "Available color options" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Red" })).toHaveClass("text-xs");
  });

  it("uses the global product grid image ratio when media ratio is automatic", () => {
    const { container } = render(
      <ThemeSettingsProvider
        settings={{ products_grid: { image_ratio: "square" } }}
      >
        <FeaturedCollectionProductCard
          product={product}
          basePath="/en/us"
          quickAdd={false}
          mobileQuickAdd={false}
          parts={[{ type: "media", settings: { aspect_ratio: "auto" } }]}
        />
      </ThemeSettingsProvider>,
    );

    expect(container.querySelector("a.relative")).toHaveClass("aspect-square");
  });
});
