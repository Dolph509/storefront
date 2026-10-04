/**
 * Homepage personalized rail → PDP → cart discovery attribution.
 */

import { expect, test } from "@playwright/test";
import { loginBuyerViaApi } from "./buyer-auth";
import {
  ensureMerchandisingDataset,
  MERCH_BUYER_A_EMAIL,
  MERCH_BUYER_PASSWORD,
  MERCH_HOME_PATH,
  storefrontGoto,
} from "./marketplace-fixtures";
import { completeRequiredPersonalization } from "./pdp-helpers";
import {
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
  await addToCart.click();
  await expect(addToCart).toBeEnabled({ timeout: 60_000 });
}

test.describe("homepage discovery attribution", () => {
  test.beforeEach(async ({ page }) => {
    await ensureMerchandisingDataset(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await removeSellerShopDiscoveryLines(page);
  });

  test("recommended rail click preserves marketplace attribution on cart line", async ({
    page,
  }) => {
    await storefrontGoto(page, MERCH_HOME_PATH);
    const rail = page.locator('[data-home-rail="recommended-for-you"]');
    await expect(rail).toBeVisible();
    const card = rail.locator("[data-merchandising-product]").first();
    await expect(card).toBeVisible();
    const sku = await card.getAttribute("data-merchandising-product");
    expect(sku).toBeTruthy();

    const link = card.getByRole("link").first();
    const href = await link.getAttribute("href");
    expect(href).toContain("src=marketplace");
    expect(href).toContain("list_id=recommendation-for-you");
    expect(href).toContain("pos=");
    expect(href).toContain("seller_id=");

    const listId = listIdFromPdpUrl(href ?? "");
    const position = positionFromPdpUrl(href ?? "");
    const sellerMatch = (href ?? "").match(/seller_id=([^&]+)/);
    const sellerId = sellerMatch?.[1];

    await link.click();
    await addToCartFromPdp(page);

    const cart = await fetchStoreCart(page);
    const line = findLineByProductSku(cart, sku!);
    expect(line).toBeTruthy();
    const attr = line!.discovery_attribution;
    expect(attr?.source_type).toBe("marketplace");
    expect(attr?.list_id).toBe(listId);
    expect(attr?.position).toBe(position);
    if (sellerId) expect(attr?.seller_id).toBe(sellerId);
    expect(attr?.product_id).toBeTruthy();
    expect(queryIdFromPdpUrl(href ?? "")).toBeUndefined();
  });
});
