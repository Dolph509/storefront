/**
 * Account shell navigation smoke.
 *
 *   pnpm exec playwright test e2e/account-visual.spec.ts --workers=1
 */

import { expect, test } from "@playwright/test";
import { loginBuyerThroughAccountForm } from "./buyer-auth";
import {
  MARKETPLACE_BUYER_EMAIL,
  MARKETPLACE_BUYER_PASSWORD,
  prepareStorefrontPage,
  storefrontGoto,
} from "./marketplace-fixtures";

const ACCOUNT_ROUTES: Array<{ path: string; heading: RegExp }> = [
  { path: "/us/en/account", heading: /^account overview$/i },
  { path: "/us/en/account/orders", heading: /^order history$/i },
  { path: "/us/en/account/favorites", heading: /^favorites$/i },
  { path: "/us/en/account/followed-shops", heading: /^followed shops$/i },
  { path: "/us/en/account/saved-searches", heading: /^saved searches$/i },
  { path: "/us/en/account/messages", heading: /^messages$/i },
  { path: "/us/en/account/addresses", heading: /^addresses$/i },
  { path: "/us/en/account/profile", heading: /^profile$/i },
];

test.describe("account visual", () => {
  test.describe.configure({ timeout: 300_000 });

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await prepareStorefrontPage(page);
    await loginBuyerThroughAccountForm(
      page,
      MARKETPLACE_BUYER_EMAIL,
      MARKETPLACE_BUYER_PASSWORD,
    );
  });

  test("account shell and primary routes", async ({ page }) => {
    for (const route of ACCOUNT_ROUTES) {
      if (new URL(page.url()).pathname !== route.path) {
        const accountLink = page.locator(
          `nav[aria-label="Account"] a[href="${route.path}"]`,
        );
        if (await accountLink.isVisible().catch(() => false)) {
          await accountLink.click();
          await expect(page).toHaveURL(route.path);
        } else {
          await storefrontGoto(page, route.path, { waitUntil: "load" });
        }
      }
      await expect(
        page.getByRole("navigation", { name: /^account$/i }),
        `account navigation missing at ${route.path}; current URL: ${page.url()}`,
      ).toBeVisible({ timeout: 30_000 });
      // Scope to the account page H1 so empty-state copy like "No messages yet"
      // cannot collide with the page title (e.g. Messages).
      await expect(
        page.getByRole("main").getByRole("heading", {
          level: 1,
          name: route.heading,
        }),
      ).toBeVisible({ timeout: 30_000 });
    }

    await page.setViewportSize({ width: 375, height: 812 });
    await storefrontGoto(page, "/us/en/account/orders");
    await expect(
      page.getByRole("heading", { name: /order history/i }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/account menu/i)).toBeVisible();
  });
});
