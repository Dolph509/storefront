/**
 * Store API cross-buyer merchandising signal isolation.
 */

import { expect, test } from "@playwright/test";
import { loginBuyerViaApi, logoutBuyer } from "./buyer-auth";
import {
  ensureMerchandisingDataset,
  MERCH_BUYER_A_EMAIL,
  MERCH_BUYER_B_EMAIL,
  MERCH_BUYER_PASSWORD,
  MERCH_SKUS,
} from "./marketplace-fixtures";

async function productSignals(
  page: import("@playwright/test").Page,
  sku: string,
) {
  const response = await page.request.get(
    `/api/v3/store/products/${sku}?fields=id,merchandising_signals`,
  );
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  return payload.data.merchandising_signals as Array<{ key: string }>;
}

test.describe("cross-buyer API isolation", () => {
  test.beforeEach(async ({ page }) => {
    await ensureMerchandisingDataset(page);
  });

  test("does not leak buyer A personalized keys to buyer B", async ({
    page,
  }) => {
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    const buyerASignals = await productSignals(page, MERCH_SKUS.followed);
    const buyerAKeys = buyerASignals.map((signal) => signal.key);
    expect(buyerAKeys).toContain("followed_shop");

    await logoutBuyer(page);
    await loginBuyerViaApi(page, MERCH_BUYER_B_EMAIL, MERCH_BUYER_PASSWORD);
    const buyerBSignals = await productSignals(page, MERCH_SKUS.followed);
    const buyerBKeys = buyerBSignals.map((signal) => signal.key);
    expect(buyerBKeys).not.toContain("followed_shop");
  });

  test("does not expose private buyer data in signal payloads", async ({
    page,
  }) => {
    await loginBuyerViaApi(page, MERCH_BUYER_A_EMAIL, MERCH_BUYER_PASSWORD);
    const signals = await productSignals(page, MERCH_SKUS.searchMatch);
    const serialized = JSON.stringify(signals);

    expect(serialized).not.toMatch(/walnut/i);
    expect(serialized).not.toMatch(/buyer/i);
    expect(serialized).not.toMatch(/affinity/i);
    const allowedKeys = new Set([
      "key",
      "label",
      "presentation",
      "priority",
      "scope",
      "source",
      "value",
    ]);
    for (const signal of signals) {
      for (const key of Object.keys(signal)) {
        expect(allowedKeys.has(key)).toBeTruthy();
      }
    }
  });
});
