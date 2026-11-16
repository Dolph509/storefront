/**
 * Dynamic adaptive storefront buyer journeys.
 *
 *   pnpm run e2e:merch:up
 *   ADAPTIVE_STOREFRONT_E2E=1 pnpm run test:e2e:merch e2e/adaptive-storefront.spec.ts
 */

import { expect, test } from "@playwright/test";
import { loginBuyerViaApi } from "./buyer-auth";
import {
  ADAPTIVE_BUYER_C_EMAIL,
  ADAPTIVE_BUYER_D_EMAIL,
  ensureAdaptiveStorefrontDataset,
  homeRail,
  MERCH_BUYER_A_EMAIL,
  MERCH_BUYER_B_EMAIL,
  MERCH_BUYER_PASSWORD,
  MERCH_HOME_PATH,
  storefrontGoto,
} from "./marketplace-fixtures";

const adaptiveEnabled = process.env.ADAPTIVE_STOREFRONT_E2E === "1";

const VIEWPORTS = [
  { width: 375, height: 800, name: "mobile" },
  { width: 768, height: 900, name: "tablet" },
  { width: 1024, height: 900, name: "laptop" },
  { width: 1440, height: 900, name: "desktop" },
] as const;

test.describe("adaptive storefront", () => {
  test.skip(!adaptiveEnabled, "Set ADAPTIVE_STOREFRONT_E2E=1");

  test("buyers A and B receive distinct composition versions", async ({
    browser,
  }) => {
    const probe = await browser.newPage();
    await ensureAdaptiveStorefrontDataset(probe);
    await probe.close();

    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await loginBuyerViaApi(pageA, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(pageA, MERCH_HOME_PATH);
    const versionA = await pageA
      .locator("[data-composition-version]")
      .first()
      .getAttribute("data-composition-version");

    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await loginBuyerViaApi(pageB, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(pageB, MERCH_HOME_PATH);
    const versionB = await pageB
      .locator("[data-composition-version]")
      .first()
      .getAttribute("data-composition-version");

    expect(versionA).toBeTruthy();
    expect(versionB).toBeTruthy();
    expect(versionA).not.toBe("static");
    expect(versionB).not.toBe("static");
    expect(versionA).not.toEqual(versionB);

    await contextA.close();
    await contextB.close();
  });

  test("buyer D does not see personalized home rails", async ({ page }) => {
    await ensureAdaptiveStorefrontDataset(page);
    await loginBuyerViaApi(page, ADAPTIVE_BUYER_D_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_HOME_PATH);
    await expect(homeRail(page, "recommended-for-you")).toHaveCount(0);
    await expect(homeRail(page, "similar-to-saved")).toHaveCount(0);
    const marker = page.locator("[data-composition-version]").first();
    if ((await marker.count()) > 0) {
      const version = await marker.getAttribute("data-composition-version");
      expect(version === "static" || version === null).toBeTruthy();
    }
  });

  test("buyer C sees gift/cart-oriented home content", async ({ page }) => {
    await ensureAdaptiveStorefrontDataset(page);
    await loginBuyerViaApi(page, ADAPTIVE_BUYER_C_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_HOME_PATH);
    await expect(
      page.getByRole("heading", { name: /picked for you/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /goes well with your cart/i }),
    ).toBeVisible();
  });

  test("composition stays stable within one session", async ({ page }) => {
    await ensureAdaptiveStorefrontDataset(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_HOME_PATH);
    const first = await page
      .locator("[data-composition-version]")
      .first()
      .getAttribute("data-composition-version");
    await storefrontGoto(page, MERCH_HOME_PATH);
    const second = await page
      .locator("[data-composition-version]")
      .first()
      .getAttribute("data-composition-version");
    expect(first).toEqual(second);
  });

  test("preview personas never require sign-in", async ({ page }) => {
    await ensureAdaptiveStorefrontDataset(page);
    await storefrontGoto(page, `${MERCH_HOME_PATH}?preview_persona=jewelry`);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByText(/sign in to see your account/i)).toHaveCount(0);
  });

  test("dismiss control hides a recommended product", async ({ page }) => {
    await ensureAdaptiveStorefrontDataset(page);
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    await storefrontGoto(page, MERCH_HOME_PATH);
    const rail = homeRail(page, "recommended-for-you");
    if ((await rail.count()) === 0) {
      test.skip(
        true,
        "Legacy rails only — theme home composition path required",
      );
    }
    const dismiss = rail
      .getByRole("button", {
        name: /not interested in this recommendation/i,
      })
      .first();
    await expect(dismiss).toBeVisible();
    const card = rail.locator("[data-merchandising-product]").first();
    const sku = await card.getAttribute("data-merchandising-product");
    await dismiss.click();
    await expect(
      rail.locator(`[data-merchandising-product="${sku}"]`),
    ).toHaveCount(0);
  });

  for (const viewport of VIEWPORTS) {
    test(`home renders at ${viewport.name} (${viewport.width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await ensureAdaptiveStorefrontDataset(page);
      await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
      await storefrontGoto(page, MERCH_HOME_PATH);
      await expect(page.locator("main")).toBeVisible();
    });
  }
});
