/**
 * recommended_for_you fallback — only when no higher-priority soft reason wins.
 */

import { expect, test } from "@playwright/test";
import { loginBuyerViaApi } from "./buyer-auth";
import {
  ensureMerchandisingDataset,
  MERCH_BUYER_A_EMAIL,
  MERCH_BUYER_PASSWORD,
  MERCH_COLLECTION_PATH,
  MERCH_SKUS,
  merchandisingCard,
  storefrontGoto,
} from "./marketplace-fixtures";

function cardReason(card: ReturnType<typeof merchandisingCard>, key: string) {
  return card.locator(`[data-merchandising-reason="${key}"]`);
}

test.describe("recommended_for_you fallback", () => {
  test.beforeEach(async ({ page }) => {
    await ensureMerchandisingDataset(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
  });

  test("shows recommended_for_you when only category affinity qualifies", async ({
    page,
  }) => {
    const card = merchandisingCard(page, MERCH_SKUS.categoryBoost);
    await expect(cardReason(card, "recommended_for_you")).toBeVisible();
    await expect(card.locator("[data-merchandising-reason]")).toHaveCount(1);
  });

  test("suppresses recommended_for_you when a higher-priority soft reason wins", async ({
    page,
  }) => {
    const card = merchandisingCard(page, MERCH_SKUS.followed);
    await expect(cardReason(card, "followed_shop")).toBeVisible();
    await expect(cardReason(card, "recommended_for_you")).toHaveCount(0);
    await expect(card.locator("[data-merchandising-reason]")).toHaveCount(1);
  });
});
