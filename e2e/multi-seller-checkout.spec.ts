import { expect, test } from "@playwright/test";
import { loginBuyerThroughAccountForm } from "./buyer-auth";
import {
  ensureMarketplaceDataset,
  MARKETPLACE_BUYER_EMAIL,
  MARKETPLACE_BUYER_PASSWORD,
  MARKETPLACE_PRODUCT_A,
  MARKETPLACE_PRODUCT_B,
} from "./marketplace-fixtures";
import { addProductToCart } from "./pdp-helpers";

/**
 * Multi-seller checkout smoke against the marketplace dev dataset.
 *
 * Prerequisites:
 *   From the Rails app root (this worktree's `server/`):
 *     bin/rails spree:marketplace:seed_dev_dataset
 *     bin/rails spree:marketplace:validate_dataset
 *   Store API + storefront running (`reuseExistingServer` in playwright.config).
 *
 * Set MARKETPLACE_E2E_REQUIRED=1 to fail instead of skip when seed data is missing.
 *
 * Completes with the seeded Check payment method when Stripe is absent.
 */

const BUYER_EMAIL = MARKETPLACE_BUYER_EMAIL;
const BUYER_PASSWORD = MARKETPLACE_BUYER_PASSWORD;
const PRODUCT_A = MARKETPLACE_PRODUCT_A;
const PRODUCT_B = MARKETPLACE_PRODUCT_B;

async function signIn(page: import("@playwright/test").Page) {
  await loginBuyerThroughAccountForm(page, BUYER_EMAIL, BUYER_PASSWORD);
}

test.describe("multi-seller checkout", () => {
  test("two seller cart completes as OrderGroup with dual shipping", async ({
    page,
  }) => {
    test.setTimeout(300_000);

    await ensureMarketplaceDataset(page);
    await signIn(page);
    await addProductToCart(page, PRODUCT_A);
    await addProductToCart(page, PRODUCT_B);

    await page.goto("/us/en/cart");
    await page.getByRole("button", { name: /open cart/i }).click();
    await expect(
      page.getByText(/Dev Seller 01 Storefront SKU/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/Dev Seller 02 Storefront SKU/i).first(),
    ).toBeVisible();

    const checkout = page.getByRole("link", { name: /^checkout$/i }).first();
    await expect(checkout).toBeVisible({ timeout: 15_000 });
    const href = await checkout.getAttribute("href");
    expect(href).toMatch(/\/checkout\/cart_/);
    await page.goto(href!);

    await expect(
      page.getByRole("heading", { name: /shipping address/i }),
    ).toBeVisible({ timeout: 30_000 });

    await page.getByPlaceholder(/^first name$/i).fill("Dev");
    await page.getByPlaceholder(/^last name$/i).fill("Buyer");
    await page.getByPlaceholder(/^address$/i).fill("123 Market St");
    await page.getByPlaceholder(/^city$/i).fill("San Francisco");
    await page.getByLabel(/state/i).selectOption({ label: "California" });
    await page.getByPlaceholder(/zip|postal/i).fill("94105");
    await page.getByRole("heading", { name: /shipping method/i }).click();

    await expect(
      page.getByText(/shipment|package|Dev Seller/i).first(),
    ).toBeVisible({ timeout: 45_000 });

    const radios = page.getByRole("radio");
    await expect(radios.first()).toBeVisible({ timeout: 45_000 });

    const expressGate = page.getByText(/not available|multiple|express/i);
    if (await expressGate.count()) {
      await expect(expressGate.first()).toBeVisible();
    }

    const placeOrder = page.getByRole("button", {
      name: /place order|pay now/i,
    });
    await expect(placeOrder).toBeEnabled({ timeout: 60_000 });
    await placeOrder.click();

    await page.waitForURL(/order-placed/, { timeout: 90_000 });
    await expect(page.getByText(/thanks for your order/i)).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/R\d+/).first()).toBeVisible();
    await expect(
      page.getByText(/Dev Seller 01 Storefront SKU/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/Dev Seller 02 Storefront SKU/i).first(),
    ).toBeVisible();
    await expect(page.getByText(/\$8\.00/).first()).toBeVisible();
    await expect(page.getByText(/\$5\.00/).first()).toBeVisible();

    await page.reload();
    await expect(
      page.getByText(/Dev Seller 01 Storefront SKU/i).first(),
    ).toBeVisible({ timeout: 30_000 });
    await expect(
      page.getByText(/Dev Seller 02 Storefront SKU/i).first(),
    ).toBeVisible();

    await page
      .getByRole("link", { name: /view order/i })
      .first()
      .click();
    await expect(page.getByText(/order #|R\d+/i).first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
