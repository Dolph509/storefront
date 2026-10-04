/**
 * PDP merchandising zone matrix.
 */

import { expect, test } from "@playwright/test";
import { loginBuyerViaApi } from "./buyer-auth";
import {
  ensureMerchandisingDataset,
  MERCH_BUYER_A_EMAIL,
  MERCH_BUYER_PASSWORD,
  MERCH_SKUS,
  storefrontGoto,
} from "./marketplace-fixtures";

test.describe("PDP merchandising zones", () => {
  test.beforeEach(async ({ page }) => {
    await ensureMerchandisingDataset(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
  });

  test("commerce and soft zones render without duplicates", async ({
    page,
  }) => {
    await storefrontGoto(page, `/us/en/products/${MERCH_SKUS.priority}`);
    await expect(
      page.locator('[data-merchandising-pdp-signal="sale"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('[data-merchandising-pdp-signal="low_stock"]').first(),
    ).toBeVisible();

    await storefrontGoto(page, `/us/en/products/${MERCH_SKUS.followed}`);
    const softReasons = page.locator("[data-merchandising-reason]");
    await expect(softReasons).toHaveCount(1);
    await expect(
      page.locator('[data-merchandising-reason="followed_shop"]').first(),
    ).toBeVisible();

    await storefrontGoto(page, `/us/en/products/${MERCH_SKUS.restock}`);
    await expect(
      page
        .locator('[data-merchandising-pdp-signal="back_in_stock_for_you"]')
        .first(),
    ).toBeVisible();

    await storefrontGoto(page, `/us/en/products/${MERCH_SKUS.priceDrop}`);
    await expect(
      page
        .locator('[data-merchandising-pdp-signal="price_drop_for_you"]')
        .first(),
    ).toBeVisible();

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
