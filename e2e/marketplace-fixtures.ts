import { type Page, test } from "@playwright/test";

/** When set, marketplace promotion E2E must not skip for missing seed data. */
export const MARKETPLACE_E2E_REQUIRED =
  process.env.MARKETPLACE_E2E_REQUIRED === "1";

/** Pre-purchase messaging buyer — must stay unblocked with Seller A after dataset seed. */
export const MARKETPLACE_BUYER_EMAIL = "dev-buyer-001@example.com";
export const MARKETPLACE_BUYER_PASSWORD = "spree123";

/** Trust & Safety Playwright buyer — general messaging with Seller A allowed at seed. */
export const TRUST_SAFETY_BUYER_EMAIL = "dev-buyer-002@example.com";
export const TRUST_SAFETY_BUYER_PASSWORD = "spree123";

export const SELLER_A_PRODUCT_SLUG = "dev-dataset-dev-seller-01-storefront-sku";

export const MARKETPLACE_PRODUCT_A = `/us/en/products/${SELLER_A_PRODUCT_SLUG}`;
export const MARKETPLACE_PRODUCT_B =
  "/us/en/products/dev-dataset-dev-seller-02-storefront-sku";

export const SELLER_A_SLUG = "dev-seller-01";
export const SELLER_A_SHOP_PATH = `/us/en/sellers/${SELLER_A_SLUG}`;
export const SELLER_A_PRODUCT_PATH = MARKETPLACE_PRODUCT_A;

const SELLER_STOREFRONT_SETUP =
  "Seller storefront dataset missing. From server/: bin/rails spree:marketplace:seed_dev_dataset && bin/rails spree:marketplace:seed_seller_storefront";

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

/** Ensures dev-seller-01 storefront exists before seller-shop E2E. */
export async function ensureSellerStorefrontDataset(page: Page) {
  const response = await page.goto(SELLER_A_SHOP_PATH);
  const missing = !response || response.status() === 404;

  if (!missing) {
    const title = await page
      .getByRole("heading", { level: 1 })
      .textContent()
      .catch(() => "");
    if (title && /dev seller/i.test(title)) return;
  }

  if (MARKETPLACE_E2E_REQUIRED) {
    throw new Error(SELLER_STOREFRONT_SETUP);
  }

  test.skip(true, SELLER_STOREFRONT_SETUP);
}
