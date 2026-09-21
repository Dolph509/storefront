import { expect, test } from "@playwright/test";

/**
 * Product reviews smoke — requires marketplace dev dataset on the Spree backend.
 *
 * Seed: `bin/rails spree:marketplace:seed_dev_dataset`
 * Buyer: `dev-buyer-001@example.com` / `spree123`
 *
 * Skipped in default CI (checkout.spec only); run locally after e2e:up + dataset seed.
 */
test.describe("product reviews", () => {
  test.skip(
    !process.env.SPREE_REVIEW_E2E,
    "Set SPREE_REVIEW_E2E=1 with marketplace dev dataset seeded",
  );

  test("buyer sees account reviews nav and product review section", async ({
    page,
  }) => {
    await page.goto("/us/en/account");
    await page.getByLabel(/^email$/i).fill("dev-buyer-001@example.com");
    await page.getByLabel(/^password$/i).fill("spree123");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByRole("link", { name: /^reviews$/i })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole("link", { name: /^reviews$/i }).click();
    await expect(
      page.getByRole("heading", { name: /^reviews$/i }),
    ).toBeVisible();

    await page.goto("/us/en/products");
    const productLink = page.locator('a[href*="/products/"]').first();
    await expect(productLink).toBeVisible({ timeout: 15_000 });
    await productLink.click();
    await expect(page.locator("#reviews")).toBeVisible({ timeout: 15_000 });
  });
});
