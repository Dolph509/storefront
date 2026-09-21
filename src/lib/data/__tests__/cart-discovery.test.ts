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

describe("addToCart discovery", () => {
  beforeEach(() => {
    itemsCreate.mockClear();
  });

  it("sends discovery payload on successful add", async () => {
    const result = await addToCart(
      "variant_abc",
      1,
      "dtc",
      undefined,
      {
        source: "recommendation_trending",
        listId: "recommendation-trending",
        position: 2,
      },
      "sess_buyer",
    );

    expect(result.success).toBe(true);
    expect(itemsCreate).toHaveBeenCalledWith(
      "cart_1",
      expect.objectContaining({
        variant_id: "variant_abc",
        discovery: {
          source_type: "recommendation_trending",
          list_id: "recommendation-trending",
          position: 2,
          session_key: "sess_buyer",
        },
      }),
      expect.any(Object),
    );
  });
});
