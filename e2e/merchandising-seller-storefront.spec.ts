/**
 * Seller storefront personalized default ordering, explicit sorts, and attribution.
 */

import { expect, test } from "@playwright/test";
import { loginBuyerViaApi, logoutBuyer } from "./buyer-auth";
import {
  ensureMerchandisingDataset,
  MERCH_BUYER_A_EMAIL,
  MERCH_BUYER_B_EMAIL,
  MERCH_BUYER_PASSWORD,
  MERCH_SELLER_A_SHOP_PATH,
  MERCH_SKUS,
  merchandisingCard,
  storefrontGoto,
} from "./marketplace-fixtures";
import { completeRequiredPersonalization } from "./pdp-helpers";
import {
  assertSellerShopAttribution,
  fetchStoreCart,
  findLineByProductSku,
  listIdFromPdpUrl,
  positionFromPdpUrl,
  removeSellerShopDiscoveryLines,
  sellerIdFromPdpUrl,
} from "./store-cart";

async function firstProductSku(page: import("@playwright/test").Page) {
  const card = page.locator("[data-merchandising-product]").first();
  await expect(card).toBeVisible();
  return card.getAttribute("data-merchandising-product");
}

async function addToCartFromPdp(page: import("@playwright/test").Page) {
  await completeRequiredPersonalization(page);
  const addToCart = page
    .locator("button")
    .filter({ hasText: /add to cart|adding/i });
  await expect(addToCart).toBeVisible({ timeout: 15_000 });
  await addToCart.click();
  await expect(addToCart).toBeEnabled({ timeout: 60_000 });
}

test.describe("seller storefront merchandising", () => {
  const productsPath = `${MERCH_SELLER_A_SHOP_PATH}?tab=products`;

  test.beforeEach(async ({ page }) => {
    await ensureMerchandisingDataset(page);
  });

  test("product links carry seller_shop attribution", async ({ page }) => {
    await storefrontGoto(page, productsPath);
    const link = merchandisingCard(page, MERCH_SKUS.sellerShopAffinity)
      .getByRole("link")
      .first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute("href");
    expect(href).toContain("src=seller_shop");
    expect(href).toContain("seller_id=");
    expect(href).toContain("list_id=");
    expect(href).toContain("pos=");
  });

  test("buyer A sees affinity product first; buyer B sees baseline first", async ({
    page,
  }) => {
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, productsPath);
    await expect(
      merchandisingCard(page, MERCH_SKUS.sellerShopAffinity),
    ).toBeVisible();
    const buyerAFirst = await firstProductSku(page);
    expect(buyerAFirst).toBe(MERCH_SKUS.sellerShopAffinity);

    await logoutBuyer(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, productsPath);
    const buyerBFirst = await firstProductSku(page);
    expect(buyerBFirst).toBe(MERCH_SKUS.sellerShopBaseline);
  });

  test("explicit sorts override personalized default ordering", async ({
    page,
  }) => {
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, `${productsPath}&sort=price_asc`);
    expect(await firstProductSku(page)).toBe(MERCH_SKUS.sellerShopAffinity);

    await storefrontGoto(page, `${productsPath}&sort=price_desc`);
    expect(await firstProductSku(page)).toBe(MERCH_SKUS.sellerShopBaseline);

    await storefrontGoto(page, `${productsPath}&sort=available_on_desc`);
    expect(await firstProductSku(page)).toBe(MERCH_SKUS.sellerShopAffinity);

    await storefrontGoto(page, `${productsPath}&sort=best_selling`);
    const bestSellingFirst = await firstProductSku(page);
    expect(bestSellingFirst).toBeTruthy();
  });

  test("seller shop click-through preserves seller_shop cart attribution by SKU", async ({
    page,
  }) => {
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await removeSellerShopDiscoveryLines(page);
    await storefrontGoto(page, productsPath);

    const card = merchandisingCard(page, MERCH_SKUS.sellerShopAffinity);
    const link = card.getByRole("link").first();
    const href = await link.getAttribute("href");
    const listId = listIdFromPdpUrl(href ?? "");
    const position = positionFromPdpUrl(href ?? "");
    const sellerId = sellerIdFromPdpUrl(href ?? "");

    await link.click();
    await addToCartFromPdp(page);

    const cart = await fetchStoreCart(page);
    const line = findLineByProductSku(cart, MERCH_SKUS.sellerShopAffinity);
    expect(line).toBeTruthy();
    assertSellerShopAttribution(line!, {
      listId,
      sellerIdFromUrl: sellerId,
    });
    expect(line!.discovery_attribution?.position).toBe(position);
  });
});
