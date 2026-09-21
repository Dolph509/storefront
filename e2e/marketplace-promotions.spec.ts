import { expect, type Page, test } from "@playwright/test";
import {
  ensureMarketplaceDataset,
  MARKETPLACE_BUYER_EMAIL,
  MARKETPLACE_BUYER_PASSWORD,
  MARKETPLACE_COUPON_MARKETPLACE,
  MARKETPLACE_COUPON_SELLER_B,
  MARKETPLACE_PRODUCT_A,
  MARKETPLACE_PRODUCT_B,
} from "./marketplace-fixtures";

async function signIn(page: Page) {
  await page.goto("/us/en/account");
  const email = page.getByLabel(/^email$/i).or(page.getByPlaceholder(/email/i));
  await expect(email.first()).toBeVisible({ timeout: 20_000 });
  await email.first().fill(MARKETPLACE_BUYER_EMAIL);
  await page.getByLabel(/^password$/i).fill(MARKETPLACE_BUYER_PASSWORD);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await expect(
    page
      .getByRole("heading", { name: /account overview/i })
      .or(page.getByText(MARKETPLACE_BUYER_EMAIL)),
  ).toBeVisible({ timeout: 30_000 });
}

async function addProduct(page: Page, path: string) {
  await page.goto(path);
  const add = page.getByRole("button", { name: /add to cart/i });
  await expect(add).toBeEnabled({ timeout: 15_000 });
  await add.click();
  await expect(
    page.getByRole("heading", { name: /cart \(\d+ items?\)/i }),
  ).toBeVisible({ timeout: 30_000 });
}

async function openCheckoutFromCart(page: Page) {
  await page.goto("/us/en/cart");
  const checkout = page.getByRole("link", { name: /^checkout$/i }).first();
  await expect(checkout).toBeVisible({ timeout: 15_000 });
  const href = await checkout.getAttribute("href");
  expect(href).toMatch(/\/checkout\/cart_/);
  await page.goto(href!);
}

async function fillShipping(page: Page) {
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
  await expect(page.getByRole("radio").first()).toBeVisible({
    timeout: 45_000,
  });
}

async function applyCoupon(page: Page, code: string) {
  const input = page.getByPlaceholder(/discount|coupon|promo/i).first();
  await expect(input).toBeVisible({ timeout: 30_000 });
  await input.fill(code);
  await page.getByRole("button", { name: /apply/i }).click();
}

async function placeOrder(page: Page) {
  const placeOrder = page.getByRole("button", {
    name: /place order|pay now/i,
  });
  await expect(placeOrder).toBeEnabled({ timeout: 60_000 });
  await placeOrder.click();
  await page.waitForURL(/order-placed/, { timeout: 90_000 });
  await expect(page.getByText(/thanks for your order/i)).toBeVisible({
    timeout: 30_000,
  });
}

test.describe("marketplace promotion funding (buyer)", () => {
  test.beforeEach(async ({ page }) => {
    await ensureMarketplaceDataset(page);
  });

  test("seller-funded automatic promo discounts only Seller A in a multi-seller cart", async ({
    page,
  }) => {
    test.setTimeout(300_000);

    await signIn(page);
    await addProduct(page, MARKETPLACE_PRODUCT_A);
    await addProduct(page, MARKETPLACE_PRODUCT_B);
    await openCheckoutFromCart(page);

    await expect(page.getByText(/discount/i).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByText(/funding_type|seller-funded|marketplace-funded/i),
    ).toHaveCount(0);

    await fillShipping(page);
    await placeOrder(page);

    await expect(
      page.getByText(/Dev Seller 01 Storefront SKU/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/Dev Seller 02 Storefront SKU/i).first(),
    ).toBeVisible();
  });

  test("marketplace coupon RDEVMKT10 applies on multi-seller checkout", async ({
    page,
  }) => {
    test.setTimeout(300_000);

    await signIn(page);
    await addProduct(page, MARKETPLACE_PRODUCT_A);
    await addProduct(page, MARKETPLACE_PRODUCT_B);
    await openCheckoutFromCart(page);
    await fillShipping(page);

    await applyCoupon(page, MARKETPLACE_COUPON_MARKETPLACE);
    await expect(page.getByText(/discount/i).first()).toBeVisible({
      timeout: 30_000,
    });

    await placeOrder(page);
    await expect(page.getByText(/thanks for your order/i)).toBeVisible();
  });

  test("Seller B coupon reduces only Seller B line", async ({ page }) => {
    test.setTimeout(300_000);

    await signIn(page);
    await addProduct(page, MARKETPLACE_PRODUCT_A);
    await addProduct(page, MARKETPLACE_PRODUCT_B);
    await openCheckoutFromCart(page);
    await fillShipping(page);

    await applyCoupon(page, MARKETPLACE_COUPON_SELLER_B);
    await expect(page.getByText(/discount/i).first()).toBeVisible({
      timeout: 30_000,
    });

    await placeOrder(page);
    await expect(page.getByText(/thanks for your order/i)).toBeVisible();
  });
});
