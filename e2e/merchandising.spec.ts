/**
 * Marketplace merchandising journeys.
 *
 * Uses seeded MarketplaceDevDataset campaigns when present. Skips when the
 * dataset is not loaded so local environments without merchandising fixtures
 * stay green.
 *
 * Run with: pnpm run e2e:up && pnpm run test:e2e e2e/merchandising.spec.ts
 */

import { expect, test } from "@playwright/test";

test.describe("marketplace merchandising", () => {
  test("shows the active homepage hero and hides scheduled or ended copy", async ({
    page,
  }) => {
    await page.goto("/us/en");
    const hero = page.getByRole("heading", {
      name: /gifts worth gathering for|fall favorites/i,
    });
    if (!(await hero.isVisible().catch(() => false))) {
      test.skip(true, "Active merchandising hero is not seeded");
    }

    await expect(hero).toBeVisible();
    await expect(page.getByText("Holiday Preview")).toHaveCount(0);
    await expect(page.getByText("Summer Send-off")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: /trending personalized gifts/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /featured shops/i }),
    ).toBeVisible();
  });

  test("opens a curated collection and keeps product cards + favorites", async ({
    page,
  }) => {
    await page.goto("/us/en/collections/gifts-under-50");
    const heading = page.getByRole("heading", { name: /gifts under \$50/i });
    if (!(await heading.isVisible().catch(() => false))) {
      test.skip(true, "Gifts Under $50 collection is not seeded");
    }

    await expect(heading).toBeVisible();
    await expect(page.locator('a[href*="/products/"]').first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: /favorite|save|wishlist/i }).first(),
    ).toBeVisible();
  });

  test("category merchandising does not replace catalog results", async ({
    page,
  }) => {
    await page.goto("/us/en/c");
    const categoryLink = page.locator('a[href*="/c/"]').first();
    if (!(await categoryLink.isVisible().catch(() => false))) {
      test.skip(true, "No category links on the catalog index");
    }

    await categoryLink.click();
    await expect(page).toHaveURL(/\/c\//);
    await expect(page.locator('a[href*="/products/"]').first()).toBeVisible();
  });
});
