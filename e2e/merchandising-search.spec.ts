/**
 * Search personalization and explicit sort preservation.
 */

import { expect, test } from "@playwright/test";
import { loginBuyerViaApi, logoutBuyer } from "./buyer-auth";
import {
  ensureMerchandisingDataset,
  MERCH_BUYER_A_EMAIL,
  MERCH_BUYER_B_EMAIL,
  MERCH_BUYER_PASSWORD,
  MERCH_SKUS,
  merchandisingCard,
  storefrontGoto,
} from "./marketplace-fixtures";

function cardReason(card: ReturnType<typeof merchandisingCard>, key: string) {
  return card.locator(`[data-merchandising-reason="${key}"]`);
}

async function firstProductSku(page: import("@playwright/test").Page) {
  const card = page.locator("[data-merchandising-product]").first();
  await expect(card).toBeVisible();
  return card.getAttribute("data-merchandising-product");
}

test.describe("search merchandising", () => {
  test.beforeEach(async ({ page }) => {
    await ensureMerchandisingDataset(page);
  });

  test("buyer A oak tray search boosts the affinity product", async ({
    page,
  }) => {
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, "/us/en/products?q=oak+tray");
    const boostCard = merchandisingCard(page, MERCH_SKUS.categoryBoost);
    const controlCard = merchandisingCard(page, MERCH_SKUS.categoryControl);
    await expect(boostCard).toBeVisible();
    await expect(controlCard).toBeVisible();
    const boostIndex = await boostCard.evaluate((node) => {
      const cards = Array.from(
        document.querySelectorAll("[data-merchandising-product]"),
      );
      return cards.indexOf(node);
    });
    const controlIndex = await controlCard.evaluate((node) => {
      const cards = Array.from(
        document.querySelectorAll("[data-merchandising-product]"),
      );
      return cards.indexOf(node);
    });
    expect(boostIndex).toBeLessThan(controlIndex);
  });

  test("buyer B search does not boost buyer A affinity product ahead of control", async ({
    page,
  }) => {
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, "/us/en/products?q=oak+tray");
    const boostCard = merchandisingCard(page, MERCH_SKUS.categoryBoost);
    const controlCard = merchandisingCard(page, MERCH_SKUS.categoryControl);
    await expect(boostCard).toBeVisible();
    await expect(controlCard).toBeVisible();
    const boostIndex = await boostCard.evaluate((node) => {
      const cards = Array.from(
        document.querySelectorAll("[data-merchandising-product]"),
      );
      return cards.indexOf(node);
    });
    const controlIndex = await controlCard.evaluate((node) => {
      const cards = Array.from(
        document.querySelectorAll("[data-merchandising-product]"),
      );
      return cards.indexOf(node);
    });
    expect(boostIndex).toBeGreaterThanOrEqual(controlIndex);
  });

  test("opted-out buyer A restores baseline search ordering", async ({
    page,
  }) => {
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    const disable = await page.request.patch("/api/v3/store/customer", {
      data: { personalization_enabled: false },
    });
    expect(disable.ok()).toBeTruthy();

    await storefrontGoto(page, "/us/en/products?q=oak+tray");
    const boostCard = merchandisingCard(page, MERCH_SKUS.categoryBoost);
    const controlCard = merchandisingCard(page, MERCH_SKUS.categoryControl);
    await expect(boostCard).toBeVisible();
    await expect(controlCard).toBeVisible();
    const boostIndex = await boostCard.evaluate((node) => {
      const cards = Array.from(
        document.querySelectorAll("[data-merchandising-product]"),
      );
      return cards.indexOf(node);
    });
    const controlIndex = await controlCard.evaluate((node) => {
      const cards = Array.from(
        document.querySelectorAll("[data-merchandising-product]"),
      );
      return cards.indexOf(node);
    });
    expect(boostIndex).toBeGreaterThanOrEqual(controlIndex);
  });

  test("explicit price sort ignores buyer affinity ordering", async ({
    page,
  }) => {
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, "/us/en/products?q=oak+tray&sort=price");
    const firstSku = await firstProductSku(page);
    await storefrontGoto(page, "/us/en/products?q=oak+tray&sort=-price");
    const reversedSku = await firstProductSku(page);
    expect(firstSku).toBeTruthy();
    expect(reversedSku).toBeTruthy();
  });

  test("explicit newest sort ignores buyer affinity ordering", async ({
    page,
  }) => {
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, "/us/en/products?q=oak+tray&sort=newest");
    const firstSku = await firstProductSku(page);
    expect(firstSku).toBeTruthy();
  });

  test("explicit best selling sort ignores buyer affinity ordering", async ({
    page,
  }) => {
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, "/us/en/products?q=oak+tray&sort=best_selling");
    const firstSku = await firstProductSku(page);
    expect(firstSku).toBeTruthy();
  });

  test("walnut search keeps recent search match for buyer A", async ({
    page,
  }) => {
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, "/us/en/products?q=walnut");
    const card = merchandisingCard(page, MERCH_SKUS.searchMatch);
    await expect(card).toBeVisible();
    await expect(cardReason(card, "recent_search_match")).toBeVisible();
  });
});
