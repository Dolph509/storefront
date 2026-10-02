/**
 * Canonical Seller A public shop journey (milestone closure).
 *
 * Run:
 *   pnpm run e2e:up
 *   $env:MARKETPLACE_E2E_REQUIRED="1"; pnpm run test:e2e e2e/seller-shop.spec.ts
 */

import { expect, test } from "@playwright/test";
import { loginBuyerThroughAccountForm } from "./buyer-auth";
import {
  ensureSellerStorefrontDataset,
  MARKETPLACE_BUYER_EMAIL,
  MARKETPLACE_BUYER_PASSWORD,
  SELLER_A_PRODUCT_PATH,
  SELLER_A_SHOP_PATH,
  SELLER_A_SLUG,
} from "./marketplace-fixtures";
import { completeRequiredPersonalization } from "./pdp-helpers";
import {
  assertSellerShopAttribution,
  fetchStoreCart,
  findLineByListId,
  listIdFromPdpUrl,
  removeSellerShopDiscoveryLines,
  sellerIdFromPdpUrl,
} from "./store-cart";

async function loginBuyer(page: import("@playwright/test").Page) {
  await loginBuyerThroughAccountForm(
    page,
    MARKETPLACE_BUYER_EMAIL,
    MARKETPLACE_BUYER_PASSWORD,
  );
}

function shopFollowButton(page: import("@playwright/test").Page) {
  return page
    .getByRole("button", { name: "Follow shop", exact: true })
    .or(page.getByRole("button", { name: "Following", exact: true }));
}

async function addToCartFromPdp(page: import("@playwright/test").Page) {
  await completeRequiredPersonalization(page);
  // Use a DOM locator so the button remains observable under the modal cart
  // drawer's aria-hidden background while the Server Action settles.
  const addToCart = page
    .locator("button")
    .filter({ hasText: /add to cart|adding/i });
  await expect(addToCart).toBeVisible({ timeout: 15_000 });
  await expect(addToCart).toBeEnabled({ timeout: 15_000 });
  await addToCart.click();
  const cartDialog = page.getByRole("dialog", { name: /cart/i });
  if (!(await cartDialog.isVisible().catch(() => false))) {
    await page.getByRole("button", { name: /open cart/i }).click();
  }
  await expect(cartDialog).toBeVisible({ timeout: 20_000 });
  // The drawer can appear while the Server Action is still resolving. Wait
  // for its pending state to clear before reading the cart through the API.
  await expect(addToCart).toBeEnabled({ timeout: 60_000 });
  // Later shop-tab checks use links behind the drawer; close it after the add
  // has settled so the modal does not intercept those navigation clicks.
  await cartDialog.getByRole("button", { name: /close cart/i }).click();
  await expect(cartDialog).toBeHidden();
}

/** Keep repeated attribution checks independent when the fixture buyer has a persisted cart. */
async function clearSellerLinesFromCart(page: import("@playwright/test").Page) {
  await removeSellerShopDiscoveryLines(page);
}

test.describe("seller storefront", () => {
  test.beforeEach(async ({ page }) => {
    await ensureSellerStorefrontDataset(page);
  });

  test("Seller A shop: branding, follow, featured, sections, search, reviews, about, policies, cart attribution", async ({
    page,
  }) => {
    // This journey exercises five discovery paths through webpack dev mode;
    // first-hit route compilation and server actions can exceed five minutes.
    test.setTimeout(600_000);

    await page.goto(SELLER_A_SHOP_PATH);

    const shopTitle = page.getByRole("heading", { level: 1 });
    await expect(shopTitle).toBeVisible({ timeout: 20_000 });
    await expect(shopTitle).toContainText(/dev seller 01/i);

    await expect(page.getByRole("link", { name: /^home$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^items$/i })).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Follow shop", exact: true }),
    ).toBeVisible();

    await loginBuyer(page);
    await clearSellerLinesFromCart(page);
    await page.goto(SELLER_A_SHOP_PATH);
    const followBtn = shopFollowButton(page);
    await expect(followBtn).toBeVisible({ timeout: 15_000 });
    const followLabel = (await followBtn.textContent()) ?? "";
    if (/^follow shop$/i.test(followLabel.trim())) {
      await followBtn.click();
      await expect(
        page.getByRole("button", { name: "Following", exact: true }),
      ).toBeVisible({
        timeout: 15_000,
      });
    }
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Following", exact: true }),
    ).toBeVisible({
      timeout: 15_000,
    });

    const featuredLink = page.locator(
      'a[href*="list_id=seller-shop-featured"][href*="dev-seller-01-storefront-sku"]',
    );
    await expect(featuredLink).toBeVisible({ timeout: 15_000 });
    const featuredHref = await featuredLink.getAttribute("href");
    expect(featuredHref).toMatch(/src=seller_shop/);
    await page.goto(featuredHref!);
    await expect(page).toHaveURL(/\/products\//, { timeout: 20_000 });
    await expect(page).toHaveURL(/src=seller_shop/);
    await expect(page).toHaveURL(/list_id=/);

    const featuredPdpUrl = page.url();
    const featuredListId = listIdFromPdpUrl(featuredPdpUrl);
    const pdpSellerId = sellerIdFromPdpUrl(featuredPdpUrl);
    expect(featuredListId).toBeTruthy();

    await addToCartFromPdp(page);

    const cartAfterFeatured = await fetchStoreCart(page);
    const featuredLine =
      findLineByListId(cartAfterFeatured, featuredListId!) ??
      cartAfterFeatured.items?.find(
        (line) => line.discovery_attribution?.source_type === "seller_shop",
      );
    expect(featuredLine).toBeTruthy();
    assertSellerShopAttribution(featuredLine!, {
      listId: featuredListId,
      sellerIdFromUrl: pdpSellerId,
    });

    await clearSellerLinesFromCart(page);
    await page.goto(SELLER_A_PRODUCT_PATH);
    await expect(page).toHaveURL(/dev-dataset-dev-seller-01-storefront-sku/);
    await page.goto(
      `${SELLER_A_PRODUCT_PATH}?src=seller_shop&list_id=seller-shop-products&pos=0${pdpSellerId ? `&seller_id=${pdpSellerId}` : ""}`,
    );
    await expect(page).toHaveURL(/src=seller_shop/);
    await expect(page).toHaveURL(/list_id=seller-shop-products/);
    await addToCartFromPdp(page);

    const cartCanonical = await fetchStoreCart(page);
    const canonicalLine = findLineByListId(
      cartCanonical,
      "seller-shop-products",
    );
    expect(canonicalLine).toBeTruthy();
    assertSellerShopAttribution(canonicalLine!, {
      listId: "seller-shop-products",
      sellerIdFromUrl: pdpSellerId,
    });

    await clearSellerLinesFromCart(page);
    await page.goto(SELLER_A_SHOP_PATH);
    const itemsHref = await page
      .getByRole("link", { name: /^items$/i })
      .getAttribute("href");
    expect(itemsHref).toMatch(/tab=products/);
    await page.goto(itemsHref!);
    await expect(page).toHaveURL(/tab=products/);

    const sectionLink = page
      .getByRole("link", { name: /wedding gifts|home decor|personalized/i })
      .first();
    if (await sectionLink.isVisible().catch(() => false)) {
      const sectionHref = await sectionLink.getAttribute("href");
      const sectionMatch = sectionHref?.match(/section=([a-z0-9-]+)/i);
      const sectionSlug = sectionMatch?.[1];
      await sectionLink.click();
      await expect(page).toHaveURL(/section=/);

      const sectionProduct = page
        .locator(`a[href*="src=seller_shop"][href*="/products/"]`)
        .first();
      if (
        sectionSlug &&
        (await sectionProduct.isVisible().catch(() => false))
      ) {
        await sectionProduct.click();
        await expect(page).toHaveURL(/src=seller_shop/);
        const sectionListId = listIdFromPdpUrl(page.url());
        if (sectionListId?.startsWith("seller-shop-section-")) {
          await addToCartFromPdp(page);
          const cartSection = await fetchStoreCart(page);
          const sectionLine = findLineByListId(cartSection, sectionListId);
          expect(sectionLine).toBeTruthy();
          assertSellerShopAttribution(sectionLine!, {
            listId: sectionListId,
            sectionSlug,
            sellerIdFromUrl: pdpSellerId,
          });
          await clearSellerLinesFromCart(page);
        }
      }
    }

    await page.goto(itemsHref!);
    const search = page.getByRole("searchbox", { name: /search this shop/i });
    await expect(search).toBeVisible({ timeout: 15_000 });
    await search.fill("DEV");
    await search.press("Enter");
    await expect(page).toHaveURL(/tab=products/);
    await expect(page).toHaveURL(/q=/);

    const searchProduct = page
      .locator(`a[href*="src=seller_shop"][href*="/products/"]`)
      .first();
    await expect(searchProduct).toBeVisible({ timeout: 15_000 });
    const searchProductHref = await searchProduct.getAttribute("href");
    expect(searchProductHref).toMatch(/src=seller_shop/);
    await page.goto(searchProductHref!);
    await expect(page).toHaveURL(/src=seller_shop/);
    const searchListId = listIdFromPdpUrl(page.url());
    expect(searchListId).toBe("seller-shop-search");

    await addToCartFromPdp(page);
    const cartSearch = await fetchStoreCart(page);
    const searchLine = findLineByListId(cartSearch, "seller-shop-search");
    expect(searchLine).toBeTruthy();
    assertSellerShopAttribution(searchLine!, {
      listId: "seller-shop-search",
      sellerIdFromUrl: pdpSellerId,
    });

    await page.getByRole("link", { name: /^reviews$/i }).click();
    await expect(page).toHaveURL(/tab=reviews/);
    await expect(
      page.getByRole("heading", { name: /^reviews$/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: /^about$/i }).click();
    await expect(page).toHaveURL(/tab=about/);

    await page.getByRole("link", { name: /shop policies/i }).click();
    await expect(page).toHaveURL(/tab=policies/);

    await page.getByRole("link", { name: /^home$/i }).click();
    await expect(page).toHaveURL(
      new RegExp(`tab=home|/sellers/${SELLER_A_SLUG}$`),
    );

    await page.getByRole("link", { name: /^items$/i }).click();
    const customOrder = page.getByRole("link", {
      name: /request custom order/i,
    });
    await expect(customOrder.first()).toBeVisible({ timeout: 15_000 });
    await customOrder.first().click();
    await expect(page).toHaveURL(/tab=custom-orders|custom-order/i);
  });
});
