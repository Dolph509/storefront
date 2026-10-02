/**
 * Seller storefront + shops visual journey (shell smoke).
 *
 *   pnpm exec playwright test e2e/seller-storefront-visual.spec.ts --workers=1
 */

import { expect, test } from "@playwright/test";
import {
  ensureSellerStorefrontDataset,
  MARKETPLACE_PRODUCT_A,
  prepareStorefrontPage,
  SELLER_A_SHOP_PATH,
  SELLER_A_SLUG,
  storefrontGoto,
} from "./marketplace-fixtures";

test.describe("seller storefront visual", () => {
  test.describe.configure({ timeout: 300_000 });

  test.beforeEach(async ({ page }) => {
    await prepareStorefrontPage(page);
    await ensureSellerStorefrontDataset(page);
  });

  test("shops directory through seller tabs and PDP round trip", async ({
    page,
  }) => {
    await storefrontGoto(page, "/us/en/shops");
    await expect(page.getByRole("heading", { name: /^shops$/i })).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.getByRole("article").first()).toBeVisible({
      timeout: 20_000,
    });

    await storefrontGoto(page, SELLER_A_SHOP_PATH);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /dev seller 01/i,
      { timeout: 20_000 },
    );
    await expect(page.getByRole("navigation").first()).toBeVisible();
    await expect(
      page
        .getByRole("button", { name: /follow shop|following/i })
        .or(page.getByRole("link", { name: /follow shop/i }))
        .first(),
    ).toBeVisible({ timeout: 15_000 });

    await storefrontGoto(page, `${SELLER_A_SHOP_PATH}?tab=products`);
    await expect(page).toHaveURL(/tab=products/);
    await expect(
      page.getByRole("searchbox", { name: /search this shop/i }),
    ).toBeVisible();

    const productHref = MARKETPLACE_PRODUCT_A;
    await storefrontGoto(page, productHref);
    await expect(page).toHaveURL(/\/products\//);
    await expect(
      page.getByRole("link", { name: /visit shop|dev seller 01/i }).first(),
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: /visit shop/i }).first(),
    ).toBeVisible();
    await storefrontGoto(page, SELLER_A_SHOP_PATH);
    await expect(page).toHaveURL(new RegExp(`/sellers/${SELLER_A_SLUG}`));

    await storefrontGoto(page, `${SELLER_A_SHOP_PATH}?tab=reviews`);
    await expect(page).toHaveURL(/tab=reviews/);

    await storefrontGoto(page, `${SELLER_A_SHOP_PATH}?tab=about`);
    await expect(page).toHaveURL(/tab=about/);

    await storefrontGoto(page, `${SELLER_A_SHOP_PATH}?tab=policies`);
    await expect(page).toHaveURL(/tab=policies/);

    await page.setViewportSize({ width: 375, height: 812 });
    await storefrontGoto(page, SELLER_A_SHOP_PATH);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("searchbox", { name: /search this shop/i }),
    ).toBeVisible();
  });
});
