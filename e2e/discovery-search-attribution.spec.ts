import { expect, test } from "@playwright/test";
import {
  ensureDiscoveryAttributionDataset,
  MARKETPLACE_CANONICAL_SEARCH_QUERY,
  signInBuyer,
} from "./discovery-attribution-fixtures";

const SEARCH_PRODUCT_TITLE = /personalized wood sign/i;

test.describe("discovery search attribution", () => {
  test("search → click → PDP context → add to cart", async ({ page }) => {
    test.setTimeout(180_000);

    await ensureDiscoveryAttributionDataset(page);

    const searchUrl = `/us/en/products?q=${encodeURIComponent(
      MARKETPLACE_CANONICAL_SEARCH_QUERY,
    )}`;
    await page.goto(searchUrl);

    const productLink = page.getByRole("link", { name: SEARCH_PRODUCT_TITLE });
    await expect(productLink.first()).toBeVisible({ timeout: 30_000 });

    await productLink.first().click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 20_000,
    });

    const persisted = await page.evaluate(() => {
      const prefix = "spree:discovery:product:";
      for (let index = 0; index < sessionStorage.length; index += 1) {
        const key = sessionStorage.key(index);
        if (!key?.startsWith(prefix)) continue;
        const raw = sessionStorage.getItem(key);
        if (!raw) continue;
        try {
          return JSON.parse(raw) as {
            source?: string;
            searchQueryId?: string;
            listId?: string;
          };
        } catch {}
      }
      return null;
    });

    expect(persisted?.source).toBe("search");
    expect(persisted?.searchQueryId).toBeTruthy();
    expect(persisted?.listId).toBe("search-results");

    await signInBuyer(page);
    await page.goto(page.url());

    const add = page.getByRole("button", { name: /add to cart/i });
    await expect(add).toBeEnabled({ timeout: 15_000 });
    await add.click();

    await expect(
      page.getByRole("heading", { name: /cart \(\d+ items?\)/i }),
    ).toBeVisible({ timeout: 30_000 });
  });
});
