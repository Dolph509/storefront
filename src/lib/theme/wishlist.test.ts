import { describe, expect, it } from "vitest";
import { isConfiguredWishlistPage } from "./wishlist";

describe("isConfiguredWishlistPage", () => {
  it("matches the selected page while wishlist is enabled or unspecified", () => {
    expect(isConfiguredWishlistPage({ wishlist_page_slug: "saved-items" }, "saved-items")).toBe(true);
    expect(isConfiguredWishlistPage({ enable_wishlist: true, wishlist_page_slug: "saved-items" }, "saved-items")).toBe(true);
  });

  it("does not treat another page or a disabled wishlist as the wishlist page", () => {
    expect(isConfiguredWishlistPage({ wishlist_page_slug: "saved-items" }, "about")).toBe(false);
    expect(isConfiguredWishlistPage({ enable_wishlist: false, wishlist_page_slug: "saved-items" }, "saved-items")).toBe(false);
    expect(isConfiguredWishlistPage({ enable_wishlist: "false", wishlist_page_slug: "saved-items" }, "saved-items")).toBe(false);
  });
});
