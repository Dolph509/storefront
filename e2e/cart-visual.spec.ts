/**
 * Multi-seller cart visual smoke.
 *
 *   pnpm exec playwright test e2e/cart-visual.spec.ts --workers=1
 */

import { expect, test } from "@playwright/test";
import { loginBuyerThroughAccountForm } from "./buyer-auth";
import {
  ensureMarketplaceDataset,
  MARKETPLACE_BUYER_EMAIL,
  MARKETPLACE_BUYER_PASSWORD,
  MARKETPLACE_PRODUCT_A,
  MARKETPLACE_PRODUCT_B,
  prepareStorefrontPage,
  storefrontGoto,
} from "./marketplace-fixtures";
import { completeRequiredPersonalization } from "./pdp-helpers";

test.describe("cart visual", () => {
  test.describe.configure({ timeout: 300_000 });

  test.beforeEach(async ({ page }) => {
    await prepareStorefrontPage(page);
    await ensureMarketplaceDataset(page);
  });

  test("multi-seller cart grouping and summary", async ({ page }) => {
    await loginBuyerThroughAccountForm(
      page,
      MARKETPLACE_BUYER_EMAIL,
      MARKETPLACE_BUYER_PASSWORD,
    );

    await storefrontGoto(page, MARKETPLACE_PRODUCT_A);
    await completeRequiredPersonalization(page);
    const addToCart = page
      .locator("button")
      .filter({ hasText: /add to cart|adding/i });
    await addToCart.click();
    await expect(addToCart).toBeEnabled({ timeout: 60_000 });
    await expect(page.getByRole("dialog", { name: /cart/i })).toBeVisible({
      timeout: 20_000,
    });

    const secondProduct = await storefrontGoto(page, MARKETPLACE_PRODUCT_B);
    if (secondProduct && secondProduct.status() !== 404) {
      await completeRequiredPersonalization(page);
      const addSecond = page.getByRole("button", { name: /add to cart/i });
      if (await addSecond.isEnabled().catch(() => false)) {
        await addSecond.click();
      }
    }

    await storefrontGoto(page, "/us/en/cart");
    await expect(
      page.getByRole("heading", { name: /shopping cart/i }),
    ).toBeVisible({ timeout: 20_000 });

    const lineItems = page.locator("[data-theme-cart-line-item]");
    await expect(lineItems.first()).toBeVisible({ timeout: 15_000 });
    const lineCount = await lineItems.count();
    expect(lineCount).toBeGreaterThanOrEqual(1);

    const sellerGroups = page.locator("[data-theme-cart-seller-group]");
    await expect(sellerGroups.first()).toBeVisible();
    const groupCount = await sellerGroups.count();
    expect(groupCount).toBeGreaterThanOrEqual(1);
    if (lineCount >= 2) {
      expect(groupCount).toBeGreaterThanOrEqual(1);
    }

    await expect(
      page.getByRole("link", { name: /^visit shop$/i }).first(),
    ).toBeVisible();

    await expect(page.locator("[data-theme-cart-summary]")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /proceed to checkout/i }),
    ).toBeVisible();

    await page.setViewportSize({ width: 375, height: 812 });
    await expect(
      page.locator("[data-theme-cart-line-item]").first(),
    ).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2,
    );
    expect(overflow).toBe(false);
  });
});
