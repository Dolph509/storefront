import { loginBuyerViaApi } from "./buyer-auth";
import { expect, test } from "./buyer-desktop-evidence";
import {
  MARKETPLACE_BUYER_EMAIL,
  MARKETPLACE_BUYER_PASSWORD,
  storefrontGoto,
} from "./marketplace-fixtures";

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
    await loginBuyerViaApi(
      page,
      MARKETPLACE_BUYER_EMAIL,
      MARKETPLACE_BUYER_PASSWORD,
    );
    await storefrontGoto(page, "/us/en/account");

    await expect(page.getByRole("link", { name: /^reviews$/i })).toBeVisible({
      timeout: 15_000,
    });

    await storefrontGoto(page, "/us/en/account/reviews", { waitUntil: "load" });
    await expect(
      page.locator("[data-theme-account-page-header]").getByRole("heading", {
        name: /^reviews$/i,
      }),
    ).toBeVisible({ timeout: 30_000 });

    await page.goto("/us/en/products");
    const productLink = page.locator('a[href*="/products/"]').first();
    await expect(productLink).toBeVisible({ timeout: 15_000 });
    await productLink.click();
    await expect(page.locator("#reviews")).toBeVisible({ timeout: 15_000 });
  });
});
