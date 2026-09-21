import { expect, type Page, test } from "@playwright/test";
import {
  ensureMarketplaceDataset,
  MARKETPLACE_BUYER_EMAIL,
  MARKETPLACE_BUYER_PASSWORD,
  MARKETPLACE_CANONICAL_SEARCH_QUERY,
  MARKETPLACE_E2E_REQUIRED,
  MARKETPLACE_PRODUCT_A,
  MARKETPLACE_PRODUCT_B,
  MARKETPLACE_SELLER_A_EMAIL,
  MARKETPLACE_SELLER_B_EMAIL,
  MARKETPLACE_SELLER_PASSWORD,
} from "./marketplace-fixtures";

export {
  MARKETPLACE_BUYER_EMAIL,
  MARKETPLACE_BUYER_PASSWORD,
  MARKETPLACE_CANONICAL_SEARCH_QUERY,
  MARKETPLACE_E2E_REQUIRED,
  MARKETPLACE_PRODUCT_A,
  MARKETPLACE_PRODUCT_B,
  MARKETPLACE_SELLER_A_EMAIL,
  MARKETPLACE_SELLER_B_EMAIL,
  MARKETPLACE_SELLER_PASSWORD,
};

const SEARCH_PRODUCT_TITLE = /personalized wood sign/i;
const CANONICAL_PRODUCT_HREF = "dev-dataset-dev-seller-01-storefront-sku";

/**
 * Ensures canonical commerce + search listing fixtures exist.
 * Fails when MARKETPLACE_E2E_REQUIRED=1 and search returns no canonical product.
 */
export async function ensureDiscoveryAttributionDataset(page: Page) {
  await ensureMarketplaceDataset(page);

  const searchUrl = `/us/en/products?q=${encodeURIComponent(
    MARKETPLACE_CANONICAL_SEARCH_QUERY,
  )}`;
  await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
  const card = page
    .locator(`a[href*="${CANONICAL_PRODUCT_HREF}"]`)
    .or(page.getByRole("link", { name: SEARCH_PRODUCT_TITLE }))
    .first();
  const visible = await card
    .waitFor({ state: "visible", timeout: 120_000 })
    .then(() => true)
    .catch(() => false);

  if (visible) {
    return;
  }

  const message =
    "Canonical search product missing. Re-run: bin/rails spree:marketplace:seed_dev_dataset";
  if (MARKETPLACE_E2E_REQUIRED) {
    throw new Error(message);
  }
  test.skip(true, message);
}

export async function signInBuyer(page: Page) {
  await page.goto("/us/en/account");
  const email = page.getByLabel(/^email$/i).or(page.getByPlaceholder(/email/i));
  await expect(email.first()).toBeVisible({ timeout: 20_000 });
  await email.first().fill(MARKETPLACE_BUYER_EMAIL);
  await page.getByLabel(/^password$/i).fill(MARKETPLACE_BUYER_PASSWORD);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await expect(
    page.getByRole("heading", { name: /account overview/i }),
  ).toBeVisible({ timeout: 30_000 });
}
