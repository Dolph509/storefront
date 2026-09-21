import { expect, test } from "@playwright/test";
import {
  ensureDiscoveryAttributionDataset,
  MARKETPLACE_BUYER_EMAIL,
  MARKETPLACE_CANONICAL_SEARCH_QUERY,
  signInBuyer,
} from "./discovery-attribution-fixtures";
import { completeMarketplaceCheckout } from "./marketplace-checkout-helpers";
import {
  fetchAttributionCoverage,
  fetchDiscoveryEventsForSession,
  fetchHistoricalUnattributed,
  fetchLineItemAttribution,
} from "./rails-discovery-assertions";

const SEARCH_PRODUCT_TITLE = /personalized wood sign/i;
const SKU_A = "DEV-SELLER-A-001";
const SKU_B = "DEV-SELLER-B-001";
const E2E_PERIOD_START = new Date(Date.now() - 60 * 60 * 1000).toISOString();

async function discoverySessionKey(page: import("@playwright/test").Page) {
  return page.evaluate(() =>
    sessionStorage.getItem("spree:discovery:session_key"),
  );
}

async function addFromPdp(page: import("@playwright/test").Page) {
  const add = page.getByRole("button", { name: /add to cart/i });
  await expect(add).toBeEnabled({ timeout: 15_000 });
  await add.click();
  await expect(
    page.getByRole("heading", { name: /cart \(\d+ items?\)/i }),
  ).toBeVisible({ timeout: 30_000 });
}

test.describe.configure({ mode: "serial" });

test.describe("discovery attribution closure", () => {
  test("search journey → checkout → persisted attribution", async ({
    page,
  }) => {
    test.setTimeout(360_000);

    await ensureDiscoveryAttributionDataset(page);

    const searchUrl = `/us/en/products?q=${encodeURIComponent(
      MARKETPLACE_CANONICAL_SEARCH_QUERY,
    )}`;
    await page.goto(searchUrl);

    const productLink = page.getByRole("link", { name: SEARCH_PRODUCT_TITLE });
    await expect(productLink.first()).toBeVisible({ timeout: 30_000 });

    const sessionKey = (await discoverySessionKey(page)) ?? "";
    const impressionsBefore = sessionKey
      ? fetchDiscoveryEventsForSession(sessionKey).impressions
      : 0;

    await productLink.first().click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 20_000,
    });

    if (sessionKey) {
      const afterClick = fetchDiscoveryEventsForSession(sessionKey);
      expect(afterClick.clicks).toBeGreaterThan(impressionsBefore > 0 ? 0 : 0);
      expect(afterClick.impressions).toBeGreaterThan(0);
    }

    await signInBuyer(page);
    await page.goto(page.url());
    await addFromPdp(page);

    const cartAttribution = fetchLineItemAttribution({
      buyerEmail: MARKETPLACE_BUYER_EMAIL,
      sku: SKU_A,
      completedOnly: false,
    });
    expect(cartAttribution.found).toBe(true);
    expect(cartAttribution.attributed).toBe(true);
    expect(cartAttribution.source_type).toBe("search");
    expect(cartAttribution.search_query_id).toBeTruthy();
    expect(cartAttribution.search_query).toBe(
      MARKETPLACE_CANONICAL_SEARCH_QUERY,
    );
    expect(cartAttribution.seller_slug).toBe("dev-seller-01");
    expect(cartAttribution.list_id).toBe("search-results");
    expect(cartAttribution.position).toBeGreaterThanOrEqual(0);

    await completeMarketplaceCheckout(page);

    const completed = fetchLineItemAttribution({
      buyerEmail: MARKETPLACE_BUYER_EMAIL,
      sku: SKU_A,
    });
    expect(completed.attributed).toBe(true);
    expect(completed.order_number).toBeTruthy();
    expect(completed.source_type).toBe("search");
    expect(completed.search_query_id).toBeTruthy();
  });

  test("multi-seller checkout preserves per-seller discovery sources", async ({
    page,
  }) => {
    test.setTimeout(420_000);

    await ensureDiscoveryAttributionDataset(page);
    await signInBuyer(page);

    const searchUrl = `/us/en/products?q=${encodeURIComponent(
      MARKETPLACE_CANONICAL_SEARCH_QUERY,
    )}`;
    await page.goto(searchUrl);
    const productLink = page.getByRole("link", { name: SEARCH_PRODUCT_TITLE });
    await expect(productLink.first()).toBeVisible({ timeout: 30_000 });
    await productLink.first().click();
    await addFromPdp(page);

    await page.goto("/us/en");
    const trendingHeading = page.getByRole("heading", {
      name: /trending/i,
    });
    await expect(trendingHeading.first()).toBeVisible({ timeout: 30_000 });
    const trendingSection = trendingHeading
      .first()
      .locator("xpath=ancestor::section[1]");
    const sellerBLink = trendingSection.locator(
      'a[href*="dev-dataset-dev-seller-02-storefront-sku"]',
    );
    await expect(sellerBLink.first()).toBeVisible({ timeout: 30_000 });
    await sellerBLink.first().click();
    await addFromPdp(page);

    await completeMarketplaceCheckout(page);

    const sellerA = fetchLineItemAttribution({
      buyerEmail: MARKETPLACE_BUYER_EMAIL,
      sku: SKU_A,
    });
    const sellerB = fetchLineItemAttribution({
      buyerEmail: MARKETPLACE_BUYER_EMAIL,
      sku: SKU_B,
    });

    expect(sellerA.source_type).toBe("search");
    expect(sellerA.search_query_id).toBeTruthy();
    expect(sellerB.source_type).toBe("recommendation_trending");
    expect(sellerB.search_query_id).toBeFalsy();
    expect(sellerA.seller_slug).toBe("dev-seller-01");
    expect(sellerB.seller_slug).toBe("dev-seller-02");
  });

  test("merchandising rail persists campaign attribution on add to cart", async ({
    page,
  }) => {
    test.setTimeout(240_000);

    await ensureDiscoveryAttributionDataset(page);
    await signInBuyer(page);
    await page.goto("/us/en");

    const railHeading = page.getByRole("heading", {
      name: /trending personalized gifts/i,
    });
    if (!(await railHeading.isVisible().catch(() => false))) {
      test.skip(true, "Merchandising product rail not seeded on homepage");
    }

    const railSection = railHeading.locator("xpath=ancestor::section[1]");
    const productLink = railSection.locator('a[href*="/products/"]').first();
    await expect(productLink).toBeVisible({ timeout: 20_000 });
    await productLink.click();
    await addFromPdp(page);

    const attribution = fetchLineItemAttribution({
      buyerEmail: MARKETPLACE_BUYER_EMAIL,
      sku: SKU_A,
    });
    expect(attribution.attributed).toBe(true);
    expect(attribution.source_type).toBe("merchandising");
    expect(attribution.campaign_id).toBeTruthy();
    expect(attribution.placement_id).toBeTruthy();
  });

  test("historical lines remain without fabricated attribution", async () => {
    const snapshot = fetchHistoricalUnattributed();
    expect(snapshot.unattributed_completed_lines).toBeGreaterThan(0);
    expect(snapshot.sample.length).toBeGreaterThan(0);
  });

  test("reports attribution coverage for the E2E window", async () => {
    const coverage = fetchAttributionCoverage(E2E_PERIOD_START);
    expect(coverage.completed_seller_lines).toBeGreaterThan(0);
    expect(coverage.attributed_lines).toBeGreaterThan(0);
    expect(coverage.coverage_percent).toBeGreaterThan(0);
  });
});
