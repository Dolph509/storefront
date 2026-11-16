/**
 * Pre-purchase messaging closure journey (buyer storefront).
 *
 *   pnpm run e2e:up
 *   $env:MARKETPLACE_E2E_REQUIRED="1"; pnpm run test:e2e e2e/prepurchase-messaging.spec.ts
 */

import { expect, test } from "@playwright/test";
import { loginBuyerThroughAccountForm } from "./buyer-auth";
import {
  ensureMarketplaceDataset,
  ensureSellerStorefrontDataset,
  MARKETPLACE_BUYER_EMAIL,
  MARKETPLACE_BUYER_PASSWORD,
  MARKETPLACE_PRODUCT_A,
  SELLER_A_SHOP_PATH,
} from "./marketplace-fixtures";

async function loginBuyer(page: import("@playwright/test").Page) {
  await loginBuyerThroughAccountForm(
    page,
    MARKETPLACE_BUYER_EMAIL,
    MARKETPLACE_BUYER_PASSWORD,
  );
}

test.describe
  .serial("Pre-purchase messaging", () => {
    test.beforeEach(async ({ page }) => {
      await ensureMarketplaceDataset(page);
      await ensureSellerStorefrontDataset(page);
    });

    test("buyer contacts shop and sees the conversation", async ({ page }) => {
      await loginBuyer(page);
      await page.goto(SELLER_A_SHOP_PATH);
      await expect(
        page.getByRole("button", { name: /^contact$/i }),
      ).toBeEnabled({ timeout: 15_000 });
      await page.getByRole("button", { name: /^contact$/i }).click();
      const body = `Can you make this in a darker finish? ${Date.now()}`;
      await page.getByPlaceholder(/write your message/i).fill(body);
      await page.getByRole("button", { name: /^send$/i }).click();
      await expect(page).toHaveURL(/\/account\/messages\/msgth_/, {
        timeout: 20_000,
      });
      await expect(page.getByText(body)).toBeVisible({ timeout: 15_000 });
    });

    test("buyer asks about a product in the same shop conversation", async ({
      page,
    }) => {
      await loginBuyer(page);
      await page.goto(MARKETPLACE_PRODUCT_A);
      await page.getByRole("button", { name: /ask about this item/i }).click();
      const body = `Larger size question ${Date.now()}`;
      await page.getByPlaceholder(/write your message/i).fill(body);
      await page.getByRole("button", { name: /^send$/i }).click();
      await expect(page).toHaveURL(/\/account\/messages\/msgth_/, {
        timeout: 20_000,
      });
      await expect(page.getByText(body)).toBeVisible({ timeout: 15_000 });
    });

    test("buyer inbox lists seller shop threads", async ({ page }) => {
      await loginBuyer(page);
      await page.goto("/us/en/account/messages");
      await expect(
        page.getByRole("link", { name: /dev seller/i }).first(),
      ).toBeVisible({ timeout: 15_000 });
    });
  });
