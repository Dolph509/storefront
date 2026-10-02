import type { Product } from "@spree/sdk";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecentlyViewedProducts } from "@/components/products/RecentlyViewedProducts";

const getProductsByIds = vi.hoisted(() => vi.fn());
vi.mock("@/lib/data/products", () => ({ getProductsByIds }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/components/products/ProductGrid", () => ({
  ProductGrid: ({ products }: { products: Product[] }) => (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  ),
}));

describe("RecentlyViewedProducts", () => {
  beforeEach(() => {
    window.localStorage.clear();
    getProductsByIds.mockReset();
  });

  it("stores the current product and displays previously viewed products", async () => {
    getProductsByIds.mockResolvedValue([
      { id: "previous", name: "Previously viewed item" },
    ]);
    window.localStorage.setItem(
      "spree-recently-viewed-products",
      JSON.stringify(["current", "previous"]),
    );

    render(
      <RecentlyViewedProducts
        productId="current"
        basePath="/us/en"
        currency="USD"
      />,
    );

    expect(
      await screen.findByText("Previously viewed item"),
    ).toBeInTheDocument();
    expect(getProductsByIds).toHaveBeenCalledWith(["previous"]);
    expect(
      JSON.parse(
        window.localStorage.getItem("spree-recently-viewed-products") || "[]",
      ),
    ).toEqual(["current", "previous"]);
  });
});
