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

/** Deterministic merchandising signal fixtures (Buyer A). */
export const MERCH_BUYER_A_EMAIL = "dev-merch-buyer-a@example.com";
/** Deterministic merchandising signal fixtures (Buyer B). */
export const MERCH_BUYER_B_EMAIL = "dev-merch-buyer-b@example.com";
export const MERCH_BUYER_PASSWORD = "spree123";
export const MERCH_COLLECTION_PATH = "/us/en/collections/merchandising-signals";
export const MERCH_SKUS = {
  lowStock: "dev-merch-low-stock-1",
  priority: "dev-merch-priority",
  bestseller: "dev-merch-bestseller",
  bestsellerControl: "dev-merch-bestseller-control",
  new: "dev-merch-new",
  notNew: "dev-merch-not-new",
  topShopYes: "dev-merch-top-shop-yes",
  topShopNo: "dev-merch-top-shop-no",
  favoriteSeed: "dev-merch-favorite-seed",
  relatedFavorite: "dev-merch-related-favorite",
  searchMatch: "dev-merch-search-match",
  followed: "dev-merch-followed",
  restock: "dev-merch-restock",
  priceDrop: "dev-merch-price-drop",
  cartInterest: "dev-merch-cart-interest",
  cartInterestControl: "dev-merch-cart-interest-control",
  popularNow: "dev-merch-popular-now",
  popularNowControl: "dev-merch-popular-now-control",
  newFromFollowed: "dev-merch-new-followed",
  purchaseSeed: "dev-merch-purchase-seed",
  similarPurchase: "dev-merch-similar-purchase",
  complementary: "dev-merch-complementary",
  viewedSeed: "dev-merch-viewed-seed",
  viewedSimilar: "dev-merch-viewed-similar",
  categoryBoost: "dev-merch-category-boost",
  categoryControl: "dev-merch-category-control",
  sellerShopAffinity: "dev-merch-seller-affinity",
  sellerShopBaseline: "dev-merch-seller-baseline",
} as const;

export const MERCH_SELLER_A_SLUG = "dev-merch-seller-a";
export const MERCH_SELLER_A_SHOP_PATH = `/us/en/sellers/${MERCH_SELLER_A_SLUG}`;
export const MERCH_FAVORITE_SEED_PATH = `/us/en/products/${MERCH_SKUS.favoriteSeed}`;
export const MERCH_HOME_PATH = "/us/en";

const DATASET_SETUP = `Marketplace dev dataset missing. From server/: bin/rails spree:marketplace:seed_dev_dataset`;
const MERCH_SETUP = `${DATASET_SETUP} (includes merchandising signal fixtures)`;

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

let merchandisingDatasetVerified = false;

/** Ensures merchandising signal collection fixtures exist before merchandising E2E. */
export async function ensureMerchandisingDataset(page: Page) {
  if (merchandisingDatasetVerified) {
    return;
  }

  const response = await storefrontGoto(page, MERCH_COLLECTION_PATH);
  const missing = !response || response.status() === 404;

  if (!missing) {
    const card = page.locator(
      `[data-merchandising-product="${MERCH_SKUS.lowStock}"]`,
    );
    if (
      await card
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      merchandisingDatasetVerified = true;
      return;
    }
  }

  if (MARKETPLACE_E2E_REQUIRED) {
    throw new Error(MERCH_SETUP);
  }

  test.skip(true, MERCH_SETUP);
}

export function merchandisingCard(page: Page, sku: string) {
  return page.locator(`[data-merchandising-product="${sku}"]`).first();
}

export function homeRail(
  page: Page,
  key: "recommended-for-you" | "similar-to-saved",
) {
  return page.locator(`[data-home-rail="${key}"]`);
}

/** Enables Top Shop badges on the merchandising E2E backend (idempotent). */
export async function enableMerchandisingTopShop() {
  if (process.env.MARKETPLACE_E2E_REQUIRED !== "1") {
    return false;
  }

  const { execSync } = await import("node:child_process");
  const composeFile = "e2e-backend/docker-compose.merchandising.yml";
  execSync(
    `docker compose -f ${composeFile} exec -T web bash -lc "cd /rails && bundle exec rails runner \\"Spree::MarketplaceDevDataset::MerchandisingSignalsFixtures.new(store: Spree::Store.default).enable_top_shop!\\""`,
    { cwd: process.cwd(), stdio: "inherit" },
  );
  return true;
}

/** Restores the default merchandising fixture preference (Top Shop off). */
export async function disableMerchandisingTopShop() {
  if (process.env.MARKETPLACE_E2E_REQUIRED !== "1") {
    return false;
  }

  const { execSync } = await import("node:child_process");
  const composeFile = "e2e-backend/docker-compose.merchandising.yml";
  execSync(
    `docker compose -f ${composeFile} exec -T web bash -lc "cd /rails && bundle exec rails runner \\"Spree::Store.default.update!(preferred_merchandising_top_shop_enabled: false)\\""`,
    { cwd: process.cwd(), stdio: "inherit" },
  );
  return true;
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
