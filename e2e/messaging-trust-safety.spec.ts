/**
 * Messaging trust & safety (buyer storefront).
 *
 *   pnpm run e2e:up
 *   $env:MARKETPLACE_E2E_REQUIRED="1"; pnpm run test:e2e e2e/messaging-trust-safety.spec.ts
 */

import { loginBuyerThroughAccountForm } from "./buyer-auth";
import { expect, test } from "./buyer-desktop-evidence";
import {
  ensureMarketplaceDataset,
  ensureSellerStorefrontDataset,
  MARKETPLACE_E2E_REQUIRED,
  MARKETPLACE_PRODUCT_A,
  SELLER_A_SHOP_PATH,
  storefrontGoto,
  TRUST_SAFETY_BUYER_EMAIL,
  TRUST_SAFETY_BUYER_PASSWORD,
} from "./marketplace-fixtures";
import { storeApiFetch } from "./store-api";

async function loginTrustSafetyBuyer(page: import("@playwright/test").Page) {
  await loginBuyerThroughAccountForm(
    page,
    TRUST_SAFETY_BUYER_EMAIL,
    TRUST_SAFETY_BUYER_PASSWORD,
  );
}

/** Prior block journeys leave Seller A blocked; reset so contact is enabled. */
async function ensureMeetTheMakerContactReady(
  page: import("@playwright/test").Page,
) {
  const sellerPanel = page.locator("details[data-theme-product-seller]");
  await expect(sellerPanel).toBeVisible({ timeout: 30_000 });
  const askAbout = page.getByRole("button", {
    name: /ask about this item/i,
  });
  if (!(await askAbout.isVisible().catch(() => false))) {
    await sellerPanel.locator("summary").click();
  }
  await expect(askAbout).toBeVisible({ timeout: 30_000 });
}

async function trustSafetyBlockExists(page: import("@playwright/test").Page) {
  const response = await storeApiFetch(
    page,
    "GET",
    "customers/me/communication_blocks",
  );
  if (!response.ok) return false;
  const payload = await response.json();
  const blocks: Array<{ seller_slug?: string }> = Array.isArray(payload)
    ? payload
    : (payload.data ?? []);
  return blocks.some((row) => row.seller_slug === "dev-seller-01");
}

async function ensureTrustSafetySellerUnblocked(
  page: import("@playwright/test").Page,
) {
  if (process.env.SPREE_API_URL !== "http://127.0.0.1:3011") {
    throw new Error("Communication-block cleanup requires isolated API 3011");
  }
  await loginTrustSafetyBuyer(page);
  const buyerResponse = await storeApiFetch(page, "GET", "customers/me");
  const buyer = await buyerResponse.json();
  if (!buyerResponse.ok || buyer.email !== TRUST_SAFETY_BUYER_EMAIL) {
    throw new Error(
      "Communication-block cleanup requires the dedicated T&S buyer",
    );
  }
  const response = await storeApiFetch(
    page,
    "GET",
    "customers/me/communication_blocks",
  );
  if (!response.ok) return;
  const payload = await response.json();
  const blocks: Array<{ id: string; seller_slug?: string }> = Array.isArray(
    payload,
  )
    ? payload
    : (payload.data ?? []);
  for (const block of blocks.filter(
    (row) => row.seller_slug === "dev-seller-01",
  )) {
    const removed = await storeApiFetch(
      page,
      "DELETE",
      `customers/me/communication_blocks/${block.id}`,
    );
    expect(removed.ok).toBe(true);
  }
}

test.describe
  .serial("Messaging trust & safety", () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        window.confirm = () => true;
      });
      await ensureMarketplaceDataset(page);
      await ensureSellerStorefrontDataset(page);
      await ensureTrustSafetySellerUnblocked(page);
    });

    test("T&S buyer can contact Seller A before blocking", async ({ page }) => {
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
      await storefrontGoto(page, SELLER_A_SHOP_PATH, { waitUntil: "load" });
      await page.getByRole("button", { name: /^contact$/i }).click();
      const composer = page.getByRole("dialog");
      await expect(composer).toBeVisible({ timeout: 15_000 });
      const body = `T&S journey ${Date.now()}`;
      await composer.getByPlaceholder(/write your message/i).fill(body);
      await composer.getByRole("button", { name: /^send$/i }).click();
      await expect(page).toHaveURL(/\/account\/messages\/msgth_/, {
        timeout: 60_000,
      });
      await expect(page.getByText(body)).toBeVisible({ timeout: 15_000 });

      await page.getByRole("button", { name: /conversation actions/i }).click();
      const blockSellerAction = page.getByRole("button", {
        name: /block seller/i,
      });
      await expect(blockSellerAction).toBeVisible({ timeout: 10_000 });
      await blockSellerAction.scrollIntoViewIfNeeded();
      await blockSellerAction.click();
      await expect
        .poll(
          async () => {
            if (await trustSafetyBlockExists(page)) return true;
            await page
              .getByRole("button", { name: /conversation actions/i })
              .click()
              .catch(() => undefined);
            const retryBlock = page.getByRole("button", {
              name: /block seller/i,
            });
            if (await retryBlock.isVisible().catch(() => false)) {
              await retryBlock.click().catch(() => undefined);
            }
            return trustSafetyBlockExists(page);
          },
          { timeout: 60_000 },
        )
        .toBe(true);
      await page.reload({ waitUntil: "load" });
      await expect(
        page.getByText(/messaging is unavailable for this conversation/i),
      ).toBeVisible({ timeout: 60_000 });
      await expect(
        page.getByRole("textbox", { name: /write a message/i }),
      ).not.toBeVisible();

      await page.goto(SELLER_A_SHOP_PATH);
      await expect(
        page.getByRole("button", { name: /^contact$/i }),
      ).toBeDisabled();

      await page.goto(MARKETPLACE_PRODUCT_A, { waitUntil: "load" });
      await ensureMeetTheMakerContactReady(page);
      await expect(
        page.getByRole("button", { name: /ask about this item/i }),
      ).toBeDisabled({ timeout: 20_000 });
      await expect(
        page.getByRole("button", { name: /add to cart/i }),
      ).toBeEnabled();

      await page.goto("/us/en/account/messages");
      await page
        .getByRole("link", { name: /dev seller/i })
        .first()
        .click({ timeout: 15_000 });
      await page.getByRole("button", { name: /conversation actions/i }).click();
      const unblockSellerAction = page.getByRole("button", {
        name: /unblock seller/i,
      });
      await expect(unblockSellerAction).toBeVisible({ timeout: 10_000 });
      await unblockSellerAction.scrollIntoViewIfNeeded();
      await unblockSellerAction.click();
      await expect
        .poll(() => trustSafetyBlockExists(page).then((exists) => !exists), {
          timeout: 60_000,
        })
        .toBe(true);
      await page.reload({ waitUntil: "load" });
      await expect(
        page.getByRole("textbox", { name: /write a message/i }),
      ).toBeVisible({
        timeout: 60_000,
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
