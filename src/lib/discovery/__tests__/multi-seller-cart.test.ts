import { beforeEach, describe, expect, it, vi } from "vitest";
import { addToCart } from "@/lib/data/cart";

const itemsCreate = vi.fn().mockResolvedValue({ id: "cart_1", items: [] });

vi.mock("@/lib/spree", () => ({
  DEFAULT_SURFACE: "dtc",
  cacheTagSuffix: () => "",
  isPoisonedDtcCartId: vi.fn().mockResolvedValue(false),
  setCartCookies: vi.fn(),
  getCartToken: vi.fn().mockResolvedValue("guest"),
  getAccessToken: vi.fn().mockResolvedValue(undefined),
  getLocaleOptions: vi.fn().mockResolvedValue({}),
  getCartId: vi.fn().mockResolvedValue("cart_1"),
  getClientForSurface: () => ({
    channel: { get: vi.fn().mockResolvedValue({ id: "ch_1" }) },
    carts: {
      get: vi
        .fn()
        .mockResolvedValue({ id: "cart_1", token: "tok", channel_id: "ch_1" }),
      create: vi.fn().mockResolvedValue({ id: "cart_1", token: "tok" }),
      items: { create: itemsCreate },
    },
  }),
}));

vi.mock("next/cache", () => ({
  updateTag: vi.fn(),
}));

describe("multi-seller cart discovery", () => {
  beforeEach(() => {
    itemsCreate.mockClear();
  });

  it("sends distinct discovery per seller add", async () => {
    await addToCart(
      "variant_a",
      1,
      "dtc",
      undefined,
      { source: "search", searchQueryId: "sqry_a", listId: "search-results" },
      "sess_1",
    );
    await addToCart(
      "variant_b",
      1,
      "dtc",
      undefined,
      {
        source: "recommendation_trending",
        listId: "recommendation-trending",
      },
      "sess_1",
    );

    expect(itemsCreate).toHaveBeenNthCalledWith(
      1,
      "cart_1",
      expect.objectContaining({
        discovery: expect.objectContaining({
          source_type: "search",
          search_query_id: "sqry_a",
        }),
      }),
      expect.any(Object),
    );
    expect(itemsCreate).toHaveBeenNthCalledWith(
      2,
      "cart_1",
      expect.objectContaining({
        discovery: expect.objectContaining({
          source_type: "recommendation_trending",
        }),
      }),
      expect.any(Object),
    );
  });
});
