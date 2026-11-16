import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  token: vi.fn(),
  list: vi.fn(),
  get: vi.fn(),
  collection: vi.fn(),
}));
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/lib/data/cached", () => ({
  PRODUCT_CARD_FIELDS: ["id", "merchandising_signals"],
}));
vi.mock("@/lib/spree", () => {
  const client = {
    products: { list: mocks.list, get: mocks.get },
    collections: { products: { list: mocks.collection } },
  };
  return {
    getAccessToken: mocks.token,
    getLocaleOptions: async () => ({ country: "us", locale: "en" }),
    getClient: () => client,
    getClientForSurface: () => client,
    DEFAULT_SURFACE: "dtc",
    cacheTagSuffix: () => "",
  };
});

import { getCategoryProducts } from "./categories";
import { getCollectionProducts } from "./collections";
import { getProduct, getProducts } from "./products";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.list.mockResolvedValue({ data: [] });
  mocks.get.mockResolvedValue({ id: "product" });
  mocks.collection.mockResolvedValue({ data: [] });
});

describe("catalog buyer context", () => {
  it("forwards DTC buyer credentials for product detail and search without persistent caching", async () => {
    mocks.token.mockResolvedValue("buyer-a");
    await getProduct("product");
    await getProducts({ search: "gift" });
    expect(mocks.get).toHaveBeenCalledWith(
      "product",
      { expand: [] },
      expect.objectContaining({ token: "buyer-a", cache: "no-store" }),
    );
    expect(mocks.list).toHaveBeenCalledWith(
      { search: "gift" },
      expect.objectContaining({ token: "buyer-a", cache: "no-store" }),
    );
  });

  it("keeps consecutive collection and category requests scoped to their buyer", async () => {
    for (const token of ["buyer-a", "buyer-b"]) {
      mocks.token.mockResolvedValue(token);
      await getCollectionProducts("collection");
      await getCategoryProducts("category");
      expect(mocks.collection).toHaveBeenLastCalledWith(
        "collection",
        expect.any(Object),
        expect.objectContaining({ token, cache: "no-store" }),
      );
      expect(mocks.list).toHaveBeenLastCalledWith(
        { in_category: "category" },
        expect.objectContaining({ token, cache: "no-store" }),
      );
    }
  });
});
