import { type Page, test } from "@playwright/test";

/** Next.js dev mode often never reaches `load`; `domcontentloaded` is enough locally. */
export async function storefrontGoto(
  page: Page,
  path: string,
  options?: Parameters<Page["goto"]>[1],
) {
  return page.goto(path, {
    waitUntil: process.env.CI ? "load" : "domcontentloaded",
    ...options,
  });
}

/** Dev overlay portals intercept clicks against `next dev`; preview/CI builds omit them. */
export async function prepareStorefrontPage(page: Page) {
  if (process.env.CI) {
    return;
  }
  await page.addInitScript(() => {
    const removeDevOverlay = () => {
      document.querySelectorAll("nextjs-portal").forEach((node) => {
        node.remove();
      });
    };
    removeDevOverlay();
    const observer = new MutationObserver(removeDevOverlay);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

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

let marketplaceDatasetVerified = false;
let sellerStorefrontDatasetVerified = false;

/**
 * Ensures canonical marketplace dev products exist before promotion E2E.
 * Skips locally when seed is absent; fails in required mode.
 */
export async function ensureMarketplaceDataset(page: Page) {
  if (marketplaceDatasetVerified) {
    return;
  }
  const response = await storefrontGoto(page, MARKETPLACE_PRODUCT_A);
  const missing = !response || response.status() === 404;

  if (!missing) {
    marketplaceDatasetVerified = true;
    return;
  }

  if (MARKETPLACE_E2E_REQUIRED) {
    throw new Error(DATASET_SETUP);
  }

  test.skip(true, DATASET_SETUP);
}

/** Ensures dev-seller-01 storefront exists before seller-shop E2E. */
export async function ensureSellerStorefrontDataset(page: Page) {
  if (sellerStorefrontDatasetVerified) {
    return;
  }
  const response = await storefrontGoto(page, SELLER_A_SHOP_PATH);
  const missing = !response || response.status() === 404;

  if (!missing) {
    const title = await page
      .getByRole("heading", { level: 1 })
      .textContent()
      .catch(() => "");
    if (title && /dev seller/i.test(title)) {
      sellerStorefrontDatasetVerified = true;
      return;
    }
  }

  if (MARKETPLACE_E2E_REQUIRED) {
    throw new Error(SELLER_STOREFRONT_SETUP);
  }

  test.skip(true, SELLER_STOREFRONT_SETUP);
}
