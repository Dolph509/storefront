/**
 * Merchandising signal acceptance journeys (global + personalized Buyer A/B).
 *
 * Run with:
 *   pnpm run e2e:merch:up
 *   pnpm run test:e2e:merch
 */

import { expect, test } from "@playwright/test";
import { loginBuyerViaApi, logoutBuyer } from "./buyer-auth";
import {
  disableMerchandisingTopShop,
  enableMerchandisingTopShop,
  ensureMerchandisingDataset,
  homeRail,
  MERCH_BUYER_A_EMAIL,
  MERCH_BUYER_B_EMAIL,
  MERCH_BUYER_PASSWORD,
  MERCH_COLLECTION_PATH,
  MERCH_FAVORITE_SEED_PATH,
  MERCH_HOME_PATH,
  MERCH_SELLER_A_SHOP_PATH,
  MERCH_SKUS,
  merchandisingCard,
  storefrontGoto,
} from "./marketplace-fixtures";
import { storeApiFetch } from "./store-api";

async function openMerchCollection(page: import("@playwright/test").Page) {
  await ensureMerchandisingDataset(page);
  await storefrontGoto(page, MERCH_COLLECTION_PATH);
}

function cardSignal(card: ReturnType<typeof merchandisingCard>, key: string) {
  return card.locator(`[data-merchandising-signal="${key}"]`);
}

function cardReason(card: ReturnType<typeof merchandisingCard>, key: string) {
  return card.locator(`[data-merchandising-reason="${key}"]`);
}

test.describe("global merchandising signals", () => {
  test.beforeEach(async ({ page }) => {
    await openMerchCollection(page);
  });

  test("low stock card and PDP stay consistent", async ({ page }) => {
    const card = merchandisingCard(page, MERCH_SKUS.lowStock);
    await expect(cardSignal(card, "low_stock")).toBeVisible();
    await card.getByRole("link").first().click();
    await expect(
      page.locator('[data-merchandising-pdp-signal="low_stock"]').first(),
    ).toBeVisible();
  });

  test("priority mix respects max badges and ordering", async ({ page }) => {
    const card = merchandisingCard(page, MERCH_SKUS.priority);
    const badges = card.locator("[data-merchandising-signal]");
    await expect(badges).toHaveCount(2);
    await expect(badges.nth(0)).toHaveAttribute(
      "data-merchandising-signal",
      "sale",
    );
    await expect(badges.nth(1)).toHaveAttribute(
      "data-merchandising-signal",
      "low_stock",
    );
    await expect(cardSignal(card, "popular_now")).toHaveCount(0);
  });

  test("sale badge appears on the priority product", async ({ page }) => {
    await expect(
      cardSignal(merchandisingCard(page, MERCH_SKUS.priority), "sale"),
    ).toBeVisible();
  });

  test("new listing shows New badge; older listing does not", async ({
    page,
  }) => {
    await expect(
      cardSignal(merchandisingCard(page, MERCH_SKUS.new), "new"),
    ).toBeVisible();
    await expect(
      cardSignal(merchandisingCard(page, MERCH_SKUS.notNew), "new"),
    ).toHaveCount(0);
  });

  test("bestseller badge appears only on qualifying product", async ({
    page,
  }) => {
    await expect(
      cardSignal(merchandisingCard(page, MERCH_SKUS.bestseller), "bestseller"),
    ).toBeVisible();
    await expect(
      cardSignal(
        merchandisingCard(page, MERCH_SKUS.bestsellerControl),
        "bestseller",
      ),
    ).toHaveCount(0);
  });

  test("top shop badge is absent when store preference is disabled", async ({
    page,
  }) => {
    await expect(
      cardSignal(merchandisingCard(page, MERCH_SKUS.topShopYes), "top_shop"),
    ).toHaveCount(0);
    await expect(
      cardSignal(merchandisingCard(page, MERCH_SKUS.topShopNo), "top_shop"),
    ).toHaveCount(0);
  });

  test("cart interest appears when threshold carts exist", async ({ page }) => {
    await expect(
      cardSignal(
        merchandisingCard(page, MERCH_SKUS.cartInterest),
        "cart_interest",
      ),
    ).toBeVisible();
  });

  test("cart interest is absent below the privacy threshold", async ({
    page,
  }) => {
    await expect(
      cardSignal(
        merchandisingCard(page, MERCH_SKUS.cartInterestControl),
        "cart_interest",
      ),
    ).toHaveCount(0);
  });

  test("popular now appears on the qualifying product only", async ({
    page,
  }) => {
    await expect(
      cardSignal(merchandisingCard(page, MERCH_SKUS.popularNow), "popular_now"),
    ).toBeVisible();
    await expect(
      cardSignal(
        merchandisingCard(page, MERCH_SKUS.popularNowControl),
        "popular_now",
      ),
    ).toHaveCount(0);
  });
});

test.describe("personalized merchandising signals", () => {
  test("buyer A sees followed shop; buyer B does not", async ({ page }) => {
    await openMerchCollection(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    const card = merchandisingCard(page, MERCH_SKUS.followed);
    await expect(cardReason(card, "followed_shop")).toBeVisible();

    await logoutBuyer(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(merchandisingCard(page, MERCH_SKUS.followed), "followed_shop"),
    ).toHaveCount(0);
  });

  test("buyer A sees similar-to-favorites; buyer B does not", async ({
    page,
  }) => {
    await openMerchCollection(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(
        merchandisingCard(page, MERCH_SKUS.relatedFavorite),
        "similar_to_favorites",
      ),
    ).toBeVisible();

    await logoutBuyer(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(
        merchandisingCard(page, MERCH_SKUS.relatedFavorite),
        "similar_to_favorites",
      ),
    ).toHaveCount(0);
  });

  test("buyer A sees recent search match; buyer B does not", async ({
    page,
  }) => {
    await openMerchCollection(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(
        merchandisingCard(page, MERCH_SKUS.searchMatch),
        "recent_search_match",
      ),
    ).toBeVisible();

    await logoutBuyer(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(
        merchandisingCard(page, MERCH_SKUS.searchMatch),
        "recent_search_match",
      ),
    ).toHaveCount(0);
  });

  test("buyer A sees back in stock; buyer B does not", async ({ page }) => {
    await openMerchCollection(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardSignal(
        merchandisingCard(page, MERCH_SKUS.restock),
        "back_in_stock_for_you",
      ),
    ).toBeVisible();

    await logoutBuyer(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardSignal(
        merchandisingCard(page, MERCH_SKUS.restock),
        "back_in_stock_for_you",
      ),
    ).toHaveCount(0);
  });

  test("buyer A sees price drop; buyer B does not", async ({ page }) => {
    await openMerchCollection(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardSignal(
        merchandisingCard(page, MERCH_SKUS.priceDrop),
        "price_drop_for_you",
      ),
    ).toBeVisible();

    await logoutBuyer(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardSignal(
        merchandisingCard(page, MERCH_SKUS.priceDrop),
        "price_drop_for_you",
      ),
    ).toHaveCount(0);
  });

  test("buyer A shows one soft reason when multiple qualify", async ({
    page,
  }) => {
    await openMerchCollection(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    const card = merchandisingCard(page, MERCH_SKUS.followed);
    await expect(card.locator("[data-merchandising-reason]")).toHaveCount(1);
  });

  test("buyer A sees new from followed shop; buyer B does not", async ({
    page,
  }) => {
    await openMerchCollection(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(
        merchandisingCard(page, MERCH_SKUS.newFromFollowed),
        "new_from_followed_shop",
      ),
    ).toBeVisible();

    await logoutBuyer(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(
        merchandisingCard(page, MERCH_SKUS.newFromFollowed),
        "new_from_followed_shop",
      ),
    ).toHaveCount(0);
  });

  test("buyer A sees viewed similar; buyer B does not", async ({ page }) => {
    await openMerchCollection(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(
        merchandisingCard(page, MERCH_SKUS.viewedSimilar),
        "viewed_similar",
      ),
    ).toBeVisible();

    await logoutBuyer(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(
        merchandisingCard(page, MERCH_SKUS.viewedSimilar),
        "viewed_similar",
      ),
    ).toHaveCount(0);
  });

  test("buyer A sees similar to purchase; buyer B does not", async ({
    page,
  }) => {
    await openMerchCollection(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(
        merchandisingCard(page, MERCH_SKUS.similarPurchase),
        "similar_to_purchase",
      ),
    ).toBeVisible();

    await logoutBuyer(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(
        merchandisingCard(page, MERCH_SKUS.similarPurchase),
        "similar_to_purchase",
      ),
    ).toHaveCount(0);
  });

  test("buyer A sees complementary item; buyer B does not", async ({
    page,
  }) => {
    await openMerchCollection(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(
        merchandisingCard(page, MERCH_SKUS.complementary),
        "complementary_item",
      ),
    ).toBeVisible();

    await logoutBuyer(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(
        merchandisingCard(page, MERCH_SKUS.complementary),
        "complementary_item",
      ),
    ).toHaveCount(0);
  });

  test("personalization opt-out removes personalized signals but keeps global", async ({
    page,
  }) => {
    await openMerchCollection(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);

    const disable = await storeApiFetch(
      page,
      "PATCH",
      "/api/v3/store/customer",
      {
        personalization_enabled: false,
      },
    );
    expect(disable.ok).toBeTruthy();

    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(merchandisingCard(page, MERCH_SKUS.followed), "followed_shop"),
    ).toHaveCount(0);
    await expect(
      cardSignal(merchandisingCard(page, MERCH_SKUS.priority), "sale"),
    ).toBeVisible();

    const enable = await storeApiFetch(
      page,
      "PATCH",
      "/api/v3/store/customer",
      {
        personalization_enabled: true,
      },
    );
    expect(enable.ok).toBeTruthy();

    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(merchandisingCard(page, MERCH_SKUS.followed), "followed_shop"),
    ).toBeVisible();
  });
});

test.describe("search merchandising", () => {
  test("buyer A search surfaces the walnut match with a personalized reason", async ({
    page,
  }) => {
    await ensureMerchandisingDataset(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, "/us/en/products?q=walnut");
    const card = merchandisingCard(page, MERCH_SKUS.searchMatch);
    await expect(card).toBeVisible();
    await expect(cardReason(card, "recent_search_match")).toBeVisible();
  });

  test("guest search does not show personalized reasons", async ({ page }) => {
    await ensureMerchandisingDataset(page);
    await storefrontGoto(page, "/us/en/products?q=walnut");
    const card = merchandisingCard(page, MERCH_SKUS.searchMatch);
    await expect(card).toBeVisible();
    await expect(card.locator("[data-merchandising-reason]")).toHaveCount(0);
  });
});

test.describe("homepage personalized rails", () => {
  test("buyer A sees recommended-for-you and similar-to-saved rails", async ({
    page,
  }) => {
    await ensureMerchandisingDataset(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_HOME_PATH);

    const recommended = homeRail(page, "recommended-for-you");
    const similar = homeRail(page, "similar-to-saved");
    await expect(recommended).toBeVisible();
    await expect(similar).toBeVisible();
    await expect(
      recommended.locator("[data-merchandising-product]").first(),
    ).toBeVisible();
    await expect(
      similar.locator("[data-merchandising-product]").first(),
    ).toBeVisible();
    expect(
      await recommended.locator("[data-merchandising-product]").count(),
    ).toBeGreaterThanOrEqual(4);
    expect(
      await similar.locator("[data-merchandising-product]").count(),
    ).toBeGreaterThanOrEqual(4);
  });

  test("buyer B does not see personalized homepage rails", async ({ page }) => {
    await ensureMerchandisingDataset(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_HOME_PATH);
    await expect(homeRail(page, "recommended-for-you")).toHaveCount(0);
    await expect(homeRail(page, "similar-to-saved")).toHaveCount(0);
  });

  test("personalization opt-out hides homepage rails", async ({ page }) => {
    await ensureMerchandisingDataset(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);

    const disable = await storeApiFetch(
      page,
      "PATCH",
      "/api/v3/store/customer",
      {
        personalization_enabled: false,
      },
    );
    expect(disable.ok).toBeTruthy();

    await storefrontGoto(page, MERCH_HOME_PATH);
    await expect(homeRail(page, "recommended-for-you")).toHaveCount(0);
    await expect(homeRail(page, "similar-to-saved")).toHaveCount(0);

    const enable = await storeApiFetch(
      page,
      "PATCH",
      "/api/v3/store/customer",
      {
        personalization_enabled: true,
      },
    );
    expect(enable.ok).toBeTruthy();
  });
});

test.describe("seller storefront merchandising", () => {
  test("seller shop lists merchandising product cards", async ({ page }) => {
    await ensureMerchandisingDataset(page);
    await storefrontGoto(page, MERCH_SELLER_A_SHOP_PATH);
    await expect(merchandisingCard(page, MERCH_SKUS.followed)).toBeVisible();
  });
});

test.describe("guest session merchandising", () => {
  test("guest browsing shows similar-to-views after a PDP visit", async ({
    page,
  }) => {
    await ensureMerchandisingDataset(page);
    await storefrontGoto(page, MERCH_FAVORITE_SEED_PATH);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(
        merchandisingCard(page, MERCH_SKUS.relatedFavorite),
        "viewed_similar",
      ),
    ).toBeVisible();
  });
});

test.describe("cross-surface merchandising", () => {
  test("guest sees global sale badge on the priority product", async ({
    page,
  }) => {
    await openMerchCollection(page);
    await expect(
      cardSignal(merchandisingCard(page, MERCH_SKUS.priority), "sale"),
    ).toBeVisible();
  });

  test("buyer A keeps global new badge when personalized signals are active", async ({
    page,
  }) => {
    await openMerchCollection(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardSignal(merchandisingCard(page, MERCH_SKUS.new), "new"),
    ).toBeVisible();
  });

  test("guest homepage does not render personalized rails", async ({
    page,
  }) => {
    await ensureMerchandisingDataset(page);
    await storefrontGoto(page, MERCH_HOME_PATH);
    await expect(homeRail(page, "recommended-for-you")).toHaveCount(0);
    await expect(homeRail(page, "similar-to-saved")).toHaveCount(0);
  });

  test("buyer B walnut search has no personalized reason", async ({ page }) => {
    await ensureMerchandisingDataset(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, "/us/en/products?q=walnut");
    const card = merchandisingCard(page, MERCH_SKUS.searchMatch);
    await expect(card).toBeVisible();
    await expect(card.locator("[data-merchandising-reason]")).toHaveCount(0);
  });

  test("buyer A PDP shows followed_shop on the followed product", async ({
    page,
  }) => {
    await ensureMerchandisingDataset(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, `/us/en/products/${MERCH_SKUS.followed}`);
    await expect(
      page.locator('[data-merchandising-reason="followed_shop"]').first(),
    ).toBeVisible();
  });

  test("buyer B still sees the global bestseller badge", async ({ page }) => {
    await openMerchCollection(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardSignal(merchandisingCard(page, MERCH_SKUS.bestseller), "bestseller"),
    ).toBeVisible();
  });

  test("buyer A still sees global low stock while personalized signals render", async ({
    page,
  }) => {
    await openMerchCollection(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardSignal(merchandisingCard(page, MERCH_SKUS.lowStock), "low_stock"),
    ).toBeVisible();
    await expect(
      cardReason(merchandisingCard(page, MERCH_SKUS.followed), "followed_shop"),
    ).toBeVisible();
  });

  test("buyer B still sees global sale on the priority product", async ({
    page,
  }) => {
    await openMerchCollection(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardSignal(merchandisingCard(page, MERCH_SKUS.priority), "sale"),
    ).toBeVisible();
  });

  test("merchandising collection renders the deterministic fixture cards", async ({
    page,
  }) => {
    await openMerchCollection(page);
    for (const sku of Object.values(MERCH_SKUS)) {
      await expect(merchandisingCard(page, sku)).toBeVisible();
    }
  });
});

test.describe("top shop merchandising", () => {
  test.afterEach(async () => {
    await disableMerchandisingTopShop();
  });

  test("top shop badge appears when store preference is enabled", async ({
    page,
  }) => {
    await ensureMerchandisingDataset(page);
    if (!(await enableMerchandisingTopShop())) {
      test.skip(true, "Top Shop enablement requires merchandising E2E backend");
    }

    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardSignal(merchandisingCard(page, MERCH_SKUS.topShopYes), "top_shop"),
    ).toBeVisible();
    await expect(
      cardSignal(merchandisingCard(page, MERCH_SKUS.topShopNo), "top_shop"),
    ).toHaveCount(0);
  });
});
