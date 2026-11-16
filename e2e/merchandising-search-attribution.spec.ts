/**
 * Search PLP → PDP → cart discovery attribution.
 */

import { expect, test } from "@playwright/test";
import { loginBuyerViaApi } from "./buyer-auth";
import {
  ensureMerchandisingDataset,
  MERCH_BUYER_A_EMAIL,
  MERCH_BUYER_PASSWORD,
  MERCH_SKUS,
  merchandisingCard,
  storefrontGoto,
} from "./marketplace-fixtures";
import { completeRequiredPersonalization } from "./pdp-helpers";
import {
  assertSearchAttribution,
  fetchStoreCart,
  findLineByProductSku,
  listIdFromPdpUrl,
  positionFromPdpUrl,
  queryIdFromPdpUrl,
  removeSellerShopDiscoveryLines,
} from "./store-cart";

async function addToCartFromPdp(page: import("@playwright/test").Page) {
  await completeRequiredPersonalization(page);
  const addToCart = page
    .locator("button")
    .filter({ hasText: /add to cart|adding/i });
  await expect(addToCart).toBeVisible({ timeout: 15_000 });
  await expect(addToCart).toBeEnabled({ timeout: 15_000 });
  await addToCart.click();
  await expect(addToCart).toBeEnabled({ timeout: 60_000 });
}

test.describe("search discovery attribution", () => {
  test.beforeEach(async ({ page }) => {
    await ensureMerchandisingDataset(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await removeSellerShopDiscoveryLines(page);
  });

  test("search click carries query_id through PDP to cart line", async ({
    page,
  }) => {
    await storefrontGoto(page, "/us/en/products?q=walnut");
    const card = merchandisingCard(page, MERCH_SKUS.searchMatch);
    await expect(card).toBeVisible();

    const link = card.getByRole("link").first();
    const href = await link.getAttribute("href");
    expect(href).toContain("src=search");
    expect(href).toContain("query_id=");
    expect(href).toContain("list_id=search-results");
    expect(href).toContain("pos=");
    expect(href).toContain("seller_id=");

    const queryId = queryIdFromPdpUrl(href ?? "");
    const listId = listIdFromPdpUrl(href ?? "");
    const position = positionFromPdpUrl(href ?? "");
    expect(queryId).toBeTruthy();
    expect(listId).toBe("search-results");
    expect(position).toBeGreaterThanOrEqual(0);

    await link.click();
    await expect(page).toHaveURL(/\/products\//);
    await expect(page).toHaveURL(/query_id=/);
    await expect(page).toHaveURL(/src=search/);

    const sellerMatch = (href ?? "").match(/seller_id=([^&]+)/);
    const sellerId = sellerMatch?.[1];

    await addToCartFromPdp(page);

    const cart = await fetchStoreCart(page);
    const line = findLineByProductSku(cart, MERCH_SKUS.searchMatch);
    expect(line).toBeTruthy();
    assertSearchAttribution(line!, {
      queryId: queryId!,
      listId: "search-results",
      position,
      sellerId,
    });
  });
});
