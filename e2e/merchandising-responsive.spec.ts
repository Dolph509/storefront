/**
 * Responsive merchandising smoke tests.
 */

import { expect, test } from "@playwright/test";
import {
  ensureMerchandisingDataset,
  homeRail,
  MERCH_COLLECTION_PATH,
  MERCH_HOME_PATH,
  MERCH_SELLER_A_SHOP_PATH,
  MERCH_SKUS,
  merchandisingCard,
  storefrontGoto,
} from "./marketplace-fixtures";

const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
];

for (const viewport of VIEWPORTS) {
  test.describe(`responsive merchandising ${viewport.width}px`, () => {
    test.use({ viewport });

    test("collection cards stay readable without horizontal overflow", async ({
      page,
    }) => {
      await ensureMerchandisingDataset(page);
      await storefrontGoto(page, MERCH_COLLECTION_PATH);
      const card = merchandisingCard(page, MERCH_SKUS.priority);
      await expect(card).toBeVisible();
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 1;
      });
      expect(overflow).toBe(false);
    });

    test("homepage rails stay visible when present", async ({ page }) => {
      await ensureMerchandisingDataset(page);
      await storefrontGoto(page, MERCH_HOME_PATH);
      const rail = homeRail(page, "recommended-for-you");
      if (await rail.count()) {
        await expect(rail).toBeVisible();
      }
    });

    test("seller storefront cards stay visible", async ({ page }) => {
      await ensureMerchandisingDataset(page);
      await storefrontGoto(page, MERCH_SELLER_A_SHOP_PATH);
      await expect(merchandisingCard(page, MERCH_SKUS.followed)).toBeVisible();
    });
  });
}
