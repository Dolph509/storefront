/**
 * Account Settings privacy toggle for personalized recommendations.
 *
 * Run with:
 *   pnpm run e2e:merch:up
 *   pnpm run test:e2e:merch e2e/privacy-personalization.spec.ts
 */

import { expect, test } from "@playwright/test";
import { loginBuyerViaApi } from "./buyer-auth";
import {
  ensureMerchandisingDataset,
  MERCH_BUYER_A_EMAIL,
  MERCH_BUYER_B_EMAIL,
  MERCH_BUYER_PASSWORD,
  MERCH_COLLECTION_PATH,
  MERCH_HOME_PATH,
  MERCH_SKUS,
  merchandisingCard,
  storefrontGoto,
} from "./marketplace-fixtures";

function cardReason(card: ReturnType<typeof merchandisingCard>, key: string) {
  return card.locator(`[data-merchandising-reason="${key}"]`);
}

test.describe("account privacy personalization", () => {
  test("privacy toggle disables homepage personalized rails", async ({
    page,
  }) => {
    await ensureMerchandisingDataset(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_HOME_PATH);
    await expect(
      page.locator('[data-home-rail="recommended-for-you"]'),
    ).toBeVisible();
    await storefrontGoto(page, "/us/en/products?q=oak+tray");
    const boostCard = merchandisingCard(page, MERCH_SKUS.categoryBoost);
    const controlCard = merchandisingCard(page, MERCH_SKUS.categoryControl);
    await expect(boostCard).toBeVisible();
    await expect(controlCard).toBeVisible();
    const boostIndexBefore = await boostCard.evaluate((node) => {
      const cards = Array.from(
        document.querySelectorAll("[data-merchandising-product]"),
      );
      return cards.indexOf(node);
    });
    const controlIndexBefore = await controlCard.evaluate((node) => {
      const cards = Array.from(
        document.querySelectorAll("[data-merchandising-product]"),
      );
      return cards.indexOf(node);
    });
    expect(boostIndexBefore).toBeLessThan(controlIndexBefore);

    await storefrontGoto(page, "/us/en/account/settings/privacy");
    const toggle = page.getByRole("checkbox", {
      name: /personalized recommendations/i,
    });
    await expect(toggle).toBeVisible();
    await toggle.setChecked(false);
    await page.getByRole("button", { name: /save settings/i }).click();
    await expect(page.getByText(/privacy settings saved/i)).toBeVisible();

    await storefrontGoto(page, MERCH_HOME_PATH);
    await expect(
      page.locator('[data-home-rail="recommended-for-you"]'),
    ).toHaveCount(0);
    await expect(
      page.locator('[data-home-rail="similar-to-saved"]'),
    ).toHaveCount(0);

    await storefrontGoto(page, "/us/en/products?q=oak+tray");
    const boostOff = merchandisingCard(page, MERCH_SKUS.categoryBoost);
    const controlOff = merchandisingCard(page, MERCH_SKUS.categoryControl);
    await expect(boostOff).toBeVisible();
    await expect(controlOff).toBeVisible();
    const boostIndexOff = await boostOff.evaluate((node) => {
      const cards = Array.from(
        document.querySelectorAll("[data-merchandising-product]"),
      );
      return cards.indexOf(node);
    });
    const controlIndexOff = await controlOff.evaluate((node) => {
      const cards = Array.from(
        document.querySelectorAll("[data-merchandising-product]"),
      );
      return cards.indexOf(node);
    });
    expect(boostIndexOff).toBeGreaterThanOrEqual(controlIndexOff);

    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(merchandisingCard(page, MERCH_SKUS.followed), "followed_shop"),
    ).toHaveCount(0);
    await expect(
      merchandisingCard(page, MERCH_SKUS.priority).locator(
        '[data-merchandising-signal="sale"]',
      ),
    ).toBeVisible();

    await storefrontGoto(page, "/us/en/account/settings/privacy");
    await expect(
      page.getByRole("checkbox", { name: /personalized recommendations/i }),
    ).not.toBeChecked();

    await page
      .getByRole("checkbox", {
        name: /personalized recommendations/i,
      })
      .setChecked(true);
    await page.getByRole("button", { name: /save settings/i }).click();
    await expect(page.getByText(/privacy settings saved/i)).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole("checkbox", { name: /personalized recommendations/i }),
    ).toBeChecked();

    await storefrontGoto(page, MERCH_HOME_PATH);
    await expect(
      page.locator('[data-home-rail="recommended-for-you"]'),
    ).toBeVisible();
    await storefrontGoto(page, MERCH_COLLECTION_PATH);
    await expect(
      cardReason(merchandisingCard(page, MERCH_SKUS.followed), "followed_shop"),
    ).toBeVisible();
    await storefrontGoto(page, "/us/en/products?q=oak+tray");
    const boostRestored = merchandisingCard(page, MERCH_SKUS.categoryBoost);
    const controlRestored = merchandisingCard(page, MERCH_SKUS.categoryControl);
    const boostIndexRestored = await boostRestored.evaluate((node) => {
      const cards = Array.from(
        document.querySelectorAll("[data-merchandising-product]"),
      );
      return cards.indexOf(node);
    });
    const controlIndexRestored = await controlRestored.evaluate((node) => {
      const cards = Array.from(
        document.querySelectorAll("[data-merchandising-product]"),
      );
      return cards.indexOf(node);
    });
    expect(boostIndexRestored).toBeLessThan(controlIndexRestored);
  });

  test("privacy toggle does not affect a clean-slate buyer", async ({
    page,
  }) => {
    await ensureMerchandisingDataset(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, "/us/en/account/settings/privacy");
    await expect(
      page.getByRole("checkbox", { name: /personalized recommendations/i }),
    ).toBeVisible();
    await page
      .getByRole("checkbox", { name: /personalized recommendations/i })
      .setChecked(false);
    await page.getByRole("button", { name: /save settings/i }).click();
    await expect(page.getByText(/privacy settings saved/i)).toBeVisible();
    await storefrontGoto(page, MERCH_HOME_PATH);
    await expect(
      page.locator('[data-home-rail="recommended-for-you"]'),
    ).toHaveCount(0);
  });
});
