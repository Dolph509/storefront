/**
 * PDP merchandising zone matrix.
 */

import { loginBuyerViaApi } from "./buyer-auth";
import { expect, test } from "./buyer-desktop-evidence";
import {
  ensureMerchandisingDataset,
  MERCH_BUYER_A_EMAIL,
  MERCH_BUYER_PASSWORD,
  MERCH_SKUS,
  storefrontGoto,
} from "./marketplace-fixtures";

test.describe("PDP merchandising zones", () => {
  test.beforeEach(async ({ page }) => {
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await ensureMerchandisingDataset(page);
  });

  test("commerce and soft zones render without duplicates", async ({
    page,
  }) => {
    await storefrontGoto(page, `/us/en/products/${MERCH_SKUS.priority}`);
    await expect(page.getByText(/50% off.*limited time sale/i)).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.locator('[data-merchandising-pdp-signal="low_stock"]').first(),
    ).toHaveCount(0);

    await storefrontGoto(page, `/us/en/products/${MERCH_SKUS.followed}`);
    await expect(
      page.locator('[data-merchandising-reason="followed_shop"]').first(),
    ).toBeVisible({ timeout: 30_000 });

    await storefrontGoto(page, `/us/en/products/${MERCH_SKUS.newFromFollowed}`);
    await expect(
      page
        .locator('[data-merchandising-reason="new_from_followed_shop"]')
        .first(),
    ).toBeVisible({ timeout: 30_000 });

    await storefrontGoto(page, `/us/en/products/${MERCH_SKUS.restock}`);
    await expect(
      page
        .locator('[data-merchandising-pdp-signal="back_in_stock_for_you"]')
        .first(),
    ).toBeVisible({ timeout: 30_000 });

    await storefrontGoto(page, `/us/en/products/${MERCH_SKUS.priceDrop}`);
    await expect(
      page
        .locator('[data-merchandising-pdp-signal="price_drop_for_you"]')
        .first(),
    ).toBeVisible({ timeout: 30_000 });

    await storefrontGoto(page, `/us/en/products/${MERCH_SKUS.bestseller}`);
    await expect(
      page.locator('[data-merchandising-pdp-signal="bestseller"]').first(),
    ).toBeVisible();

    await storefrontGoto(page, `/us/en/products/${MERCH_SKUS.new}`);
    await expect(
      page.locator('[data-merchandising-pdp-signal="new"]').first(),
    ).toBeVisible();
  });
});
