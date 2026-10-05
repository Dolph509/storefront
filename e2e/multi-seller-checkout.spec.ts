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
import {
  assertBuyerCart,
  fetchStoreCart,
  startAuthenticatedEmptyCart,
} from "./store-cart";

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
    const cartId = await startAuthenticatedEmptyCart(page, BUYER_EMAIL);
    await assertBuyerCart(page, BUYER_EMAIL, cartId, 0);
    await addProductToCart(page, PRODUCT_A);
    await assertBuyerCart(page, BUYER_EMAIL, cartId, 1);
    await expect
      .poll(
        async () =>
          (await fetchStoreCart(page)).items?.map((item) => item.name) ?? [],
      )
      .toEqual(
        expect.arrayContaining([
          expect.stringContaining("Dev Seller 01 Storefront SKU"),
        ]),
      );
    await assertBuyerCart(page, BUYER_EMAIL, cartId, 1);
    await addProductToCart(page, PRODUCT_B);
    await assertBuyerCart(page, BUYER_EMAIL, cartId, 2);
    await expect
      .poll(
        async () =>
          (await fetchStoreCart(page)).items?.map((item) => item.name) ?? [],
      )
      .toEqual(
        expect.arrayContaining([
          expect.stringContaining("Dev Seller 01 Storefront SKU"),
          expect.stringContaining("Dev Seller 02 Storefront SKU"),
        ]),
      );

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

    const addressField = page.getByPlaceholder(/^address$/i);
    if (await addressField.count()) {
      await page.getByPlaceholder(/^first name$/i).fill("Dev");
      await page.getByPlaceholder(/^last name$/i).fill("Buyer");
      await addressField.fill("123 Market St");
      await page.getByPlaceholder(/^city$/i).fill("San Francisco");
      await page.getByLabel(/state/i).selectOption({ label: "California" });
      await page.getByPlaceholder(/zip|postal/i).fill("94105");
      await page.getByRole("radio").first().focus();
    } else {
      await expect(
        page.getByRole("radio", { name: /123 Market St, San Francisco/i }),
      ).toBeChecked();
    }
    await expect
      .poll(
        async () => {
          const cart = await fetchStoreCart(page);
          return cart.id === cartId && Boolean(cart.shipping_address?.address1);
        },
        { timeout: 30_000 },
      )
      .toBe(true);

    await expect(page.getByText(/shipping address is required/i)).toHaveCount(
      0,
      { timeout: 30_000 },
    );

    await expect(
      page.getByText(
        /enter your shipping address to view available shipping methods/i,
      ),
    ).toHaveCount(0, { timeout: 45_000 });

    const standardRate = page.getByRole("radio", { name: /Standard \$5\.00/i });
    await expect(standardRate).toBeVisible({ timeout: 45_000 });
    await expect(standardRate).toBeChecked();

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
    const sellerOrderHeadings = page.getByRole("heading", {
      name: /seller order/i,
    });
    await expect(sellerOrderHeadings).toHaveCount(2);
    const orderLinks = page.getByRole("link", { name: /view order/i });
    await expect(orderLinks).toHaveCount(2);
    await expect(page.getByText(/Standard\s*·\s*\$2\.50/)).toHaveCount(2);

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
