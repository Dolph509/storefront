import type { Product } from "@spree/sdk";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductCard } from "@/components/products/ProductCard";
import { clearDiscoveryDedupeCache } from "@/lib/discovery/dedupe";

const recordClick = vi.fn();
const recordImpression = vi.fn();

vi.mock("@/lib/discovery/discovery-analytics", () => ({
  recordDiscoveryClick: (...args: unknown[]) => recordClick(...args),
  recordDiscoveryImpression: (...args: unknown[]) => recordImpression(...args),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/components/products/FavoriteButton", () => ({
  FavoriteButton: () => null,
}));

vi.mock("@/lib/analytics/gtm", () => ({
  trackSelectItem: vi.fn(),
}));

const product = {
  id: "prod_search",
  name: "Wood Sign",
  slug: "wood-sign",
  purchasable: true,
  default_variant_id: "variant_1",
  price: { display_amount: "$20.00", amount_in_cents: 2000 },
} as unknown as Product;

describe("search discovery on ProductCard", () => {
  beforeEach(() => {
    clearDiscoveryDedupeCache();
    recordClick.mockClear();
    recordImpression.mockClear();
  });

  it("records impression once and click with search query context", async () => {
    const discovery = {
      source: "search" as const,
      searchQueryId: "sqry_test",
      listId: "search-results",
      position: 0,
    };

    render(
      <ProductCard
        product={product}
        basePath="/us/en"
        index={0}
        listId="search-results"
        listName="Search Results"
        currency="USD"
        discovery={discovery}
        discoveryPageKey="state-1"
        showFavorite={false}
      />,
    );

    await waitFor(() => {
      expect(recordImpression).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("link", { name: "Wood Sign" }));
    expect(recordClick).toHaveBeenCalledWith(product, discovery);
  });
});
