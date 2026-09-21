import { type Page, test } from "@playwright/test";

/** When set, marketplace promotion E2E must not skip for missing seed data. */
export const MARKETPLACE_E2E_REQUIRED =
  process.env.MARKETPLACE_E2E_REQUIRED === "1";

export const MARKETPLACE_BUYER_EMAIL = "dev-buyer-001@example.com";
export const MARKETPLACE_BUYER_PASSWORD = "spree123";

/** Stable slug from MarketplaceDevDataset::CANONICAL_SEARCH_PRODUCT_SLUG */
export const MARKETPLACE_PRODUCT_A =
  "/us/en/products/dev-dataset-dev-seller-01-storefront-sku";
export const MARKETPLACE_PRODUCT_B =
  "/us/en/products/dev-dataset-dev-seller-02-storefront-sku";

/** Canonical Seller A search attribution term (Helpers::CANONICAL_SEARCH_QUERY). */
export const MARKETPLACE_CANONICAL_SEARCH_QUERY = "personalized wood sign";

export const MARKETPLACE_SELLER_A_EMAIL = "dev-seller-01@example.com";
export const MARKETPLACE_SELLER_B_EMAIL = "dev-seller-02@example.com";
export const MARKETPLACE_SELLER_PASSWORD = "spree123";

export const MARKETPLACE_COUPON_MARKETPLACE = "RDEVMKT10";
export const MARKETPLACE_COUPON_SELLER_B = "RDEVSELLERB5";

const DATASET_SETUP = `Marketplace dev dataset missing. From server/: bin/rails spree:marketplace:seed_dev_dataset`;

/**
 * Ensures canonical marketplace dev products exist before promotion E2E.
 * Skips locally when seed is absent; fails in required mode.
 */
export async function ensureMarketplaceDataset(page: Page) {
  const response = await page.goto(MARKETPLACE_PRODUCT_A);
  const missing = !response || response.status() === 404;

  if (!missing) {
    return;
  }

  if (MARKETPLACE_E2E_REQUIRED) {
    throw new Error(DATASET_SETUP);
  }

  test.skip(true, DATASET_SETUP);
}
