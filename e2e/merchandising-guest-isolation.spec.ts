/**
 * Guest session isolation for session-scoped merchandising signals.
 */

import { expect, test } from "@playwright/test";
import {
  ensureMerchandisingDataset,
  MERCH_COLLECTION_PATH,
  MERCH_FAVORITE_SEED_PATH,
  MERCH_SKUS,
  merchandisingCard,
  storefrontGoto,
} from "./marketplace-fixtures";

function cardReason(card: ReturnType<typeof merchandisingCard>, key: string) {
  return card.locator(`[data-merchandising-reason="${key}"]`);
}

test.describe("guest session isolation", () => {
  test("guest B does not inherit guest A session views", async ({
    browser,
  }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await ensureMerchandisingDataset(pageA);
    await ensureMerchandisingDataset(pageB);

    await storefrontGoto(pageA, MERCH_FAVORITE_SEED_PATH);
    await expect(pageA.getByRole("heading", { level: 1 })).toBeVisible();
    await storefrontGoto(pageA, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(
        merchandisingCard(pageA, MERCH_SKUS.relatedFavorite),
        "viewed_similar",
      ),
    ).toBeVisible();

    await storefrontGoto(pageB, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(
        merchandisingCard(pageB, MERCH_SKUS.relatedFavorite),
        "viewed_similar",
      ),
    ).toHaveCount(0);

    await contextA.close();
    await contextB.close();
  });
});
