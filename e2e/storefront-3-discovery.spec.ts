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
  prepareStorefrontPage,
  SELLER_A_SHOP_PATH,
  storefrontGoto,
} from "./marketplace-fixtures";

test.describe("storefront 3 discovery", () => {
  test.describe.configure({ timeout: 300_000 });

  test.beforeEach(async ({ page }) => {
    await prepareStorefrontPage(page);
    await ensureMarketplaceDataset(page);
    await ensureSellerStorefrontDataset(page);
  });

  test("homepage to shops directory to seller shop and product", async ({
    page,
  }) => {
    await storefrontGoto(page, "/us/en");
    await expect(
      page
        .getByRole("heading", {
          name: /jump into featured interests|browse by interest|gift guides|most-loved categories/i,
        })
        .first(),
    ).toBeVisible({ timeout: 20_000 });

    await storefrontGoto(page, "/us/en/shops");
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
    await storefrontGoto(page, shopHref!);
    await expect(page).toHaveURL(/\/sellers\/dev-seller-01/);

    await storefrontGoto(page, "/us/en");
    const productTitleLink = page
      .getByRole("heading", { name: /dev seller 01 storefront sku/i })
      .getByRole("link")
      .first();
    await expect(productTitleLink).toBeVisible({ timeout: 20_000 });
    const productHref = await productTitleLink.getAttribute("href");
    expect(productHref).toMatch(/dev-dataset-dev-seller-01-storefront-sku/);
    await storefrontGoto(page, productHref!);
    await expect(page).toHaveURL(
      /\/products\/dev-dataset-dev-seller-01-storefront-sku/,
    );

    await storefrontGoto(page, SELLER_A_SHOP_PATH);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /dev seller 01/i,
    );
  });
});
