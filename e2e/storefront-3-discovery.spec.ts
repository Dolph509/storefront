/**
 * Storefront 3.0 discovery journey (homepage → shops → seller → product).
 *
 *   pnpm run e2e:up
 *   $env:MARKETPLACE_E2E_REQUIRED="1"; pnpm run test:e2e e2e/storefront-3-discovery.spec.ts
 */

import { expect, test } from "@playwright/test";
import {
  ensureMarketplaceDataset,
  ensureSellerStorefrontDataset,
  MARKETPLACE_PRODUCT_A,
  SELLER_A_SHOP_PATH,
} from "./marketplace-fixtures";

test.describe("storefront 3 discovery", () => {
  test.beforeEach(async ({ page }) => {
    await ensureMarketplaceDataset(page);
    await ensureSellerStorefrontDataset(page);
  });

  test("homepage to shops directory to seller shop and product", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    await page.goto("/us/en");
    await expect(
      page
        .getByRole("heading", { name: /browse by interest|gift guides/i })
        .first(),
    ).toBeVisible({ timeout: 20_000 });

    await page.goto("/us/en/shops");
    await expect(page.getByRole("heading", { name: /^shops$/i })).toBeVisible({
      timeout: 20_000,
    });

    const sellerCard = page.getByRole("article").filter({
      has: page.getByRole("heading", { name: /dev seller 01/i }),
    });
    const visitShop = sellerCard.getByRole("link", { name: /^visit shop$/i });
    await expect(visitShop).toBeVisible({ timeout: 15_000 });
    await visitShop.scrollIntoViewIfNeeded();
    const shopHref = await visitShop.getAttribute("href");
    expect(shopHref).toMatch(/dev-seller-01/);
    await page.goto(shopHref!);
    await expect(page).toHaveURL(/\/sellers\/dev-seller-01/);

    await page.goto("/us/en");
    const productLink = page
      .locator(`a[href*="${MARKETPLACE_PRODUCT_A.split("/").pop()}"]`)
      .first();
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();
      await expect(page).toHaveURL(/\/products\//);
    } else {
      await page.goto(MARKETPLACE_PRODUCT_A);
      await expect(page).toHaveURL(/\/products\//);
    }

    await page.goto(SELLER_A_SHOP_PATH);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /dev seller 01/i,
    );
  });
});
