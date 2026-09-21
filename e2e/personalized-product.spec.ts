/**
 * Personalized product purchase path.
 *
 * Requires MarketplaceDevDataset personalizations (Seller A engraved product).
 * Skips when the seeded product is not present — Windows/local native tooling
 * often cannot rebuild the dataset; CI/Linux should run this green.
 *
 * Run with: pnpm run e2e:up && pnpm run test:e2e e2e/personalized-product.spec.ts
 */

import { expect, test } from "@playwright/test";

const BUYER_EMAIL = process.env.E2E_BUYER_EMAIL ?? "buyer@example.com";
const BUYER_PASSWORD = process.env.E2E_BUYER_PASSWORD ?? "spree123";

test.describe("personalized product purchase", () => {
  test("configures personalization, carts snapshot, and keeps Sarah vs Michael separate", async ({
    page,
  }) => {
    test.setTimeout(180_000);

    await page.goto("/us/en/account");
    const email = page.getByLabel(/email/i).first();
    if (await email.isVisible().catch(() => false)) {
      await email.fill(BUYER_EMAIL);
      await page
        .getByLabel(/password/i)
        .first()
        .fill(BUYER_PASSWORD);
      await page
        .getByRole("button", { name: /sign in|log in/i })
        .first()
        .click();
    }

    // Prefer dataset slug; fall back to any product advertising personalization.
    await page.goto("/us/en/products");
    const personalizedLink = page
      .locator('a[href*="/products/"]')
      .filter({ hasText: /engrav|personal|custom|sign/i })
      .first();

    if (!(await personalizedLink.isVisible().catch(() => false))) {
      test.skip(
        true,
        "Personalized dataset product not available in this environment",
      );
    }

    await personalizedLink.click();
    await expect(page).toHaveURL(/\/products\//);

    const personalizeHeading = page
      .getByText(/personalize this item|personalization/i)
      .first();
    if (!(await personalizeHeading.isVisible().catch(() => false))) {
      test.skip(true, "PDP has no personalization schema");
    }

    const textInputs = page.locator('input[type="text"], textarea');
    if ((await textInputs.count()) > 0) {
      await textInputs.first().fill("Sarah");
    }

    const radios = page.getByRole("radio");
    if ((await radios.count()) > 0) {
      await radios.first().click();
    }

    const addToCart = page
      .getByRole("button", { name: /add to cart/i })
      .first();
    await addToCart.click();

    await expect(page.getByText(/sarah/i).first()).toBeVisible({
      timeout: 15_000,
    });

    // Second configuration with a different name should become a separate line.
    await page.goBack();
    if ((await textInputs.count()) > 0) {
      await textInputs.first().fill("Michael");
    }
    await addToCart.click();

    await page.goto("/us/en/cart");
    await expect(page.getByText(/sarah/i).first()).toBeVisible();
    await expect(page.getByText(/michael/i).first()).toBeVisible();
  });
});
