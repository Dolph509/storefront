/**
 * Messaging trust & safety (buyer storefront).
 *
 *   pnpm run e2e:up
 *   $env:MARKETPLACE_E2E_REQUIRED="1"; pnpm run test:e2e e2e/messaging-trust-safety.spec.ts
 */

import { expect, test } from "@playwright/test";
import { loginBuyerThroughAccountForm } from "./buyer-auth";
import {
  ensureMarketplaceDataset,
  ensureSellerStorefrontDataset,
  MARKETPLACE_E2E_REQUIRED,
  MARKETPLACE_PRODUCT_A,
  SELLER_A_SHOP_PATH,
  TRUST_SAFETY_BUYER_EMAIL,
  TRUST_SAFETY_BUYER_PASSWORD,
} from "./marketplace-fixtures";

async function loginTrustSafetyBuyer(page: import("@playwright/test").Page) {
  await loginBuyerThroughAccountForm(
    page,
    TRUST_SAFETY_BUYER_EMAIL,
    TRUST_SAFETY_BUYER_PASSWORD,
  );
}

test.describe
  .serial("Messaging trust & safety", () => {
    test.beforeEach(async ({ page }) => {
      await ensureMarketplaceDataset(page);
      await ensureSellerStorefrontDataset(page);
    });

    test("T&S buyer can contact Seller A before blocking", async ({ page }) => {
      await loginTrustSafetyBuyer(page);
      await page.goto(SELLER_A_SHOP_PATH);
      const contact = page.getByRole("button", { name: /^contact$/i });
      await expect(contact).toBeEnabled({ timeout: 15_000 });
      if (MARKETPLACE_E2E_REQUIRED) {
        await expect(
          page.getByText(/messaging is unavailable for this conversation/i),
        ).not.toBeVisible();
      }
    });

    test("full block, storefront, unblock, and report journey", async ({
      page,
    }) => {
      await loginTrustSafetyBuyer(page);
      await page.goto(SELLER_A_SHOP_PATH);
      await page.getByRole("button", { name: /^contact$/i }).click();
      const body = `T&S journey ${Date.now()}`;
      await page.getByPlaceholder(/write your message/i).fill(body);
      await page.getByRole("button", { name: /^send$/i }).click();
      await expect(page).toHaveURL(/\/account\/messages\/msgth_/, {
        timeout: 20_000,
      });
      await expect(page.getByText(body)).toBeVisible({ timeout: 15_000 });

      page.once("dialog", (dialog) => dialog.accept());
      await page.getByRole("button", { name: /block seller/i }).click();

      await expect(
        page.getByText(/messaging is unavailable for this conversation/i),
      ).toBeVisible({ timeout: 10_000 });
      await expect(page.getByPlaceholder(/write a message/i)).not.toBeVisible();

      await page.goto(SELLER_A_SHOP_PATH);
      await expect(
        page.getByRole("button", { name: /^contact$/i }),
      ).toBeDisabled();

      await page.goto(MARKETPLACE_PRODUCT_A);
      await expect(
        page.getByRole("button", { name: /ask about this item/i }),
      ).toBeDisabled();
      await expect(
        page.getByRole("button", { name: /add to cart/i }),
      ).toBeEnabled();

      await page.goto("/us/en/account/messages");
      await page
        .getByRole("link", { name: /dev seller/i })
        .first()
        .click({ timeout: 15_000 });
      await page.getByRole("button", { name: /unblock seller/i }).click();
      await expect(page.getByPlaceholder(/write a message/i)).toBeVisible({
        timeout: 15_000,
      });

      await page.getByRole("button", { name: /^report$/i }).click();
      await page
        .getByPlaceholder(/describe what happened/i)
        .fill(`Trust safety e2e report ${Date.now()}`);
      await page.getByRole("button", { name: /submit report/i }).click();
      await expect(page.getByRole("button", { name: /^report$/i })).toBeVisible(
        { timeout: 10_000 },
      );
    });
  });
