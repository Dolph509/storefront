import { expect, type Page } from "@playwright/test";

export async function completeMarketplaceCheckout(page: Page) {
  await page.goto("/us/en/cart");
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
