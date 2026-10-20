/**
 * recommended_for_you fallback — only when no higher-priority soft reason wins.
 */

import { loginBuyerViaApi } from "./buyer-auth";
import { expect, test } from "./buyer-desktop-evidence";
import {
  ensureMerchandisingDataset,
  MERCH_BUYER_A_EMAIL,
  MERCH_BUYER_PASSWORD,
  MERCH_COLLECTION_PATH,
  MERCH_SKUS,
  type merchandisingCard,
  storefrontGoto,
} from "./marketplace-fixtures";

function cardReason(card: ReturnType<typeof merchandisingCard>, key: string) {
  return card.locator(`[data-merchandising-reason="${key}"]`);
}

test.describe("recommended_for_you fallback", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await ensureMerchandisingDataset(page);
    const email = testInfo.title.startsWith("shows recommended_for_you")
      ? "dev-e2e-category-only@example.com"
      : MERCH_BUYER_A_EMAIL;
    await loginBuyerViaApi(page, email, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
  });

  test("shows recommended_for_you when only category affinity qualifies", async ({
    page,
  }) => {
    const card = page
      .locator("[data-theme-listing-layout]")
      .locator(`[data-merchandising-product="${MERCH_SKUS.categoryBoost}"]`)
      .first();
    await expect(cardReason(card, "recommended_for_you")).toBeVisible();
    await expect(card.locator("[data-merchandising-reason]")).toHaveCount(1);
  });

  test("suppresses recommended_for_you when a higher-priority soft reason wins", async ({
    page,
  }) => {
    const card = page
      .locator("[data-theme-listing-layout]")
      .locator(`[data-merchandising-product="${MERCH_SKUS.newFromFollowed}"]`)
      .first();
    await expect(cardReason(card, "new_from_followed_shop")).toBeVisible();
    await expect(cardReason(card, "recommended_for_you")).toHaveCount(0);
    await expect(card.locator("[data-merchandising-reason]")).toHaveCount(1);
  });
});
