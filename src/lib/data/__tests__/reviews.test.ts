import { beforeEach, describe, expect, it, vi } from "vitest";

const { state } = vi.hoisted(() => ({ state: { client: {} as any } }));

vi.mock("@/lib/spree", () => ({
  getClient: () => state.client,
  getLocaleOptions: async () => ({ locale: "en" }),
  withAuthRefresh: async (callback: (options: object) => Promise<unknown>) =>
    callback({}),
}));

import {
  getMyProductReviews,
  getProductReviews,
  getReviewablePurchases,
  getSellerReviews,
} from "@/lib/data/reviews";

const page = {
  data: [{ id: "review_1", rating: 5 }],
  meta: { page: 1, limit: 25, count: 1, pages: 1 },
};

describe("review loaders", () => {
  beforeEach(() => {
    state.client = {};
    vi.restoreAllMocks();
  });

  it("returns populated product reviews when the SDK method exists", async () => {
    const list = vi.fn().mockResolvedValue(page);
    state.client = { products: { reviews: { list } } };

    await expect(getProductReviews("prod_1")).resolves.toEqual(page);
    expect(list).toHaveBeenCalledWith("prod_1", undefined);
  });

  it("preserves an empty product review response", async () => {
    const empty = { data: [], meta: { page: 1, count: 0 } };
    state.client = {
      products: { reviews: { list: vi.fn().mockResolvedValue(empty) } },
    };

    await expect(getProductReviews("prod_1")).resolves.toEqual(empty);
  });

  it("returns an empty page and warns when product review methods are absent", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await getProductReviews("prod_1");

    expect(result.data).toEqual([]);
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining("products.reviews.list"),
    );
  });

  it("loads seller reviews through the SDK and safely handles an unsupported method", async () => {
    const list = vi.fn().mockResolvedValue(page);
    state.client = { sellers: { reviews: { list } } };
    await expect(getSellerReviews("seller_1", 2, 5, "newest")).resolves.toEqual(
      page,
    );
    expect(list).toHaveBeenCalledWith(
      "seller_1",
      { page: 2, limit: 5, sort: "newest" },
      { locale: "en" },
    );

    state.client = { sellers: {} };
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect((await getSellerReviews("seller_1")).data).toEqual([]);
    expect(warning).toHaveBeenCalledWith(
      expect.stringContaining("sellers.reviews.list"),
    );
  });

  it("returns empty buyer review data when the installed SDK lacks review endpoints", async () => {
    state.client = { customer: {} };

    await expect(getMyProductReviews()).resolves.toMatchObject({ data: [] });
    await expect(getReviewablePurchases()).resolves.toEqual({
      data: [],
      meta: { count: 0 },
    });
  });

  it("loads buyer review data when the SDK endpoints exist", async () => {
    const reviews = { data: [{ id: "review_1" }], meta: { count: 1 } };
    const purchases = { data: [{ id: "purchase_1" }], meta: { count: 1 } };
    state.client = {
      customer: {
        productReviews: { list: vi.fn().mockResolvedValue(reviews) },
        reviewablePurchases: { list: vi.fn().mockResolvedValue(purchases) },
      },
    };

    await expect(getMyProductReviews()).resolves.toEqual(reviews);
    await expect(getReviewablePurchases()).resolves.toEqual(purchases);
  });
});
