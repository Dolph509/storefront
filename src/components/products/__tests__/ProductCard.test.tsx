import type { Product } from "@spree/sdk";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductCard } from "@/components/products/ProductCard";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/contexts/StoreContext", () => ({
  useStore: () => ({ currency: "USD", locale: "en", loading: false }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: false, loading: false }),
}));

vi.mock("@/components/products/FavoriteButton", () => ({
  FavoriteButton: () => null,
}));

const baseProduct = {
  id: "prod-1",
  name: "Classic T-Shirt",
  slug: "classic-t-shirt",
  purchasable: true,
  thumbnail_url: "https://example.com/shirt.jpg",
  seller_id: "sel_1",
  seller_name: "Oak Studio",
  seller_slug: "oak-studio",
  average_rating: 4.9,
  reviews_count: 128,
  price: {
    display_amount: "$25.00",
    amount_in_cents: 2500,
    compare_at_amount_in_cents: null,
    display_compare_at_amount: null,
  },
  original_price: {
    display_amount: "$25.00",
    amount_in_cents: 2500,
  },
} as unknown as Product;

const saleProduct = {
  id: "prod-2",
  name: "Sale T-Shirt",
  slug: "sale-t-shirt",
  purchasable: true,
  thumbnail_url: "https://example.com/shirt.jpg",
  seller_id: null,
  seller_name: null,
  seller_slug: null,
  price: {
    display_amount: "$15.00",
    amount_in_cents: 1500,
    compare_at_amount_in_cents: null,
    display_compare_at_amount: null,
  },
  original_price: {
    display_amount: "$25.00",
    amount_in_cents: 2500,
  },
} as unknown as Product;

const outOfStockProduct = {
  id: "prod-3",
  name: "Sold Out Item",
  slug: "sold-out-item",
  purchasable: false,
  thumbnail_url: "https://example.com/shirt.jpg",
  price: {
    display_amount: "$25.00",
    amount_in_cents: 2500,
    compare_at_amount_in_cents: null,
    display_compare_at_amount: null,
  },
  original_price: {
    display_amount: "$25.00",
    amount_in_cents: 2500,
  },
} as unknown as Product;

const noImageProduct = {
  id: "prod-4",
  name: "No Image Product",
  slug: "no-image",
  purchasable: true,
  thumbnail_url: null,
  price: {
    display_amount: "$25.00",
    amount_in_cents: 2500,
    compare_at_amount_in_cents: null,
    display_compare_at_amount: null,
  },
  original_price: {
    display_amount: "$25.00",
    amount_in_cents: 2500,
  },
} as unknown as Product;

describe("ProductCard", () => {
  it("renders product name and price", () => {
    render(
      <ProductCard
        product={baseProduct}
        basePath="/us/en"
        showFavorite={false}
      />,
    );

    expect(screen.getByText("Classic T-Shirt")).toBeInTheDocument();
    expect(screen.getByText("$25.00")).toBeInTheDocument();
  });

  it("links to the product page", () => {
    render(
      <ProductCard
        product={baseProduct}
        basePath="/us/en"
        showFavorite={false}
      />,
    );

    const link = screen.getByRole("link", { name: "Classic T-Shirt" });
    expect(link).toHaveAttribute("href", "/us/en/products/classic-t-shirt");
  });

  it("shows seller attribution with shop link", () => {
    render(
      <ProductCard
        product={baseProduct}
        basePath="/us/en"
        showFavorite={false}
      />,
    );

    const sellerLink = screen.getByRole("link", { name: "Oak Studio" });
    expect(sellerLink).toHaveAttribute("href", "/us/en/sellers/oak-studio");
  });

  it("shows Sale badge when on sale", () => {
    render(
      <ProductCard
        product={saleProduct}
        basePath="/us/en"
        showFavorite={false}
      />,
    );

    expect(screen.getByText("sale")).toBeInTheDocument();
  });

  it("shows strikethrough price when on sale", () => {
    render(
      <ProductCard
        product={saleProduct}
        basePath="/us/en"
        showFavorite={false}
      />,
    );

    expect(screen.getByText("$15.00")).toBeInTheDocument();
    expect(screen.getByText("$25.00")).toBeInTheDocument();
    const strikethrough = screen.getByText("$25.00");
    expect(strikethrough).toHaveClass("line-through");
  });

  it("does not show Sale badge for regular price products", () => {
    render(
      <ProductCard
        product={baseProduct}
        basePath="/us/en"
        showFavorite={false}
      />,
    );

    expect(screen.queryByText("sale")).not.toBeInTheDocument();
  });

  it("shows Out of Stock for non-purchasable products", () => {
    render(
      <ProductCard
        product={outOfStockProduct}
        basePath="/us/en"
        showFavorite={false}
      />,
    );

    expect(screen.getByText("outOfStock")).toBeInTheDocument();
  });

  it("renders image when thumbnail_url is provided", () => {
    render(
      <ProductCard
        product={baseProduct}
        basePath="/us/en"
        showFavorite={false}
      />,
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/shirt.jpg");
    expect(img).toHaveAttribute("alt", "Classic T-Shirt");
  });

  it("renders placeholder when no thumbnail", () => {
    render(
      <ProductCard
        product={noImageProduct}
        basePath="/us/en"
        showFavorite={false}
      />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("uses empty basePath by default", () => {
    render(<ProductCard product={baseProduct} showFavorite={false} />);

    const link = screen.getByRole("link", { name: "Classic T-Shirt" });
    expect(link).toHaveAttribute("href", "/products/classic-t-shirt");
  });
});
