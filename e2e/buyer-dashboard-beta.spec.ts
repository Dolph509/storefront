/**
 * Focused buyer dashboard beta closure suite.
 *
 *   pnpm exec playwright test e2e/buyer-dashboard-beta.spec.ts --workers=1
 *
 * Provider-dependent paths (SMS, OAuth, Stripe setup) assert graceful degrade
 * only — they do not require external providers to succeed.
 */

import { expect, test } from "@playwright/test";
import { loginBuyerThroughAccountForm } from "./buyer-auth";
import {
  MARKETPLACE_BUYER_EMAIL,
  MARKETPLACE_BUYER_PASSWORD,
  prepareStorefrontPage,
  storefrontGoto,
} from "./marketplace-fixtures";

async function expectSettingsContent(
  page: import("@playwright/test").Page,
  marker: RegExp,
) {
  const content = page.locator("main").last();
  await expect(content).not.toHaveText(/^Loading\.\.\.$/, { timeout: 30_000 });
  await expect(content).toContainText(marker, { timeout: 30_000 });
}

test.describe("buyer dashboard beta", () => {
  test.describe.configure({ timeout: 240_000 });

  test("signed-out settings routes redirect to login", async ({ page }) => {
    await prepareStorefrontPage(page);
    await storefrontGoto(page, "/us/en/account/settings/account");
    await expect(page).toHaveURL(/\/us\/en\/account(\?|$)/);
    await expect(page.getByLabel(/^email$/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/dev-buyer-001@example.com/i)).toHaveCount(0);
  });

  test("settings hub, region prefs, provider degrade, and redirects", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await prepareStorefrontPage(page);
    await loginBuyerThroughAccountForm(
      page,
      MARKETPLACE_BUYER_EMAIL,
      MARKETPLACE_BUYER_PASSWORD,
    );

    await storefrontGoto(page, "/us/en/account/settings/account");
    await expect(
      page.getByRole("heading", { name: /account settings/i }),
    ).toBeVisible({ timeout: 30_000 });
    await expectSettingsContent(
      page,
      /about you|member since|location settings/i,
    );
    await expect(
      page
        .getByRole("navigation", { name: /account settings/i })
        .getByRole("link", { name: /^account$/i }),
    ).toHaveAttribute("aria-current", "page");

    for (const [path, marker] of [
      ["/us/en/account/settings/security", /password|2-factor|phone/i],
      [
        "/us/en/account/settings/public-profile",
        /bio|profile photo|other accounts/i,
      ],
      [
        "/us/en/account/settings/privacy",
        /download|blocked|close your account/i,
      ],
      [
        "/us/en/account/settings/addresses",
        /address|add address|shipping|billing/i,
      ],
      [
        "/us/en/account/settings/credit-cards",
        /card setup is unavailable|no payment methods saved|payment methods/i,
      ],
      [
        "/us/en/account/settings/notifications",
        /email|marketing|newsletter|communication/i,
      ],
    ] as const) {
      await storefrontGoto(page, path);
      await expectSettingsContent(page, marker);
    }

    await storefrontGoto(page, "/us/en/account/settings/security");
    await expectSettingsContent(
      page,
      /no connectable providers are configured/i,
    );
    const enableTwoFactor = page.getByRole("button", { name: /turn 2fa on/i });
    if (await enableTwoFactor.isVisible().catch(() => false)) {
      await enableTwoFactor.click();
      await expect(
        page.getByText("Authenticator app", { exact: true }),
      ).toBeVisible();
      await expect(page.getByText(/SMS \(Unavailable\)/i)).toBeVisible();
      await expect(page.getByText(/Phone call \(Unavailable\)/i)).toBeVisible();
      await page.keyboard.press("Escape");
    }

    for (const legacy of [
      {
        from: "/us/en/account/profile",
        to: /\/account\/settings\/public-profile\/?$/,
      },
      {
        from: "/us/en/account/addresses",
        to: /\/account\/settings\/addresses\/?$/,
      },
      {
        from: "/us/en/account/credit-cards",
        to: /\/account\/settings\/credit-cards\/?$/,
      },
      {
        from: "/us/en/account/blocked-shops",
        to: /\/account\/settings\/privacy\/?$/,
      },
    ]) {
      await storefrontGoto(page, legacy.from, { waitUntil: "commit" });
      await expect(page).toHaveURL(legacy.to, { timeout: 30_000 });
    }
  });

  test("orders, messages, and responsive settings", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await prepareStorefrontPage(page);
    await loginBuyerThroughAccountForm(
      page,
      MARKETPLACE_BUYER_EMAIL,
      MARKETPLACE_BUYER_PASSWORD,
    );

    await storefrontGoto(page, "/us/en/account/orders");
    await expect(
      page
        .locator("main")
        .last()
        .getByRole("heading", {
          level: 1,
          name: /^order history$/i,
        }),
    ).toBeVisible({ timeout: 30_000 });

    await storefrontGoto(page, "/us/en/account/messages");
    await expect(
      page
        .locator("main")
        .last()
        .getByRole("heading", {
          level: 1,
          name: /^messages$/i,
        }),
    ).toBeVisible({ timeout: 30_000 });

    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await storefrontGoto(page, "/us/en/account/settings/account");
      await expect(page.getByText(/about you/i)).toBeVisible({
        timeout: 30_000,
      });
      const overflowPx = await page.evaluate(() => {
        const root = document.documentElement;
        return root.scrollWidth - root.clientWidth;
      });
      if (width >= 768) {
        expect(
          overflowPx,
          `horizontal overflow at ${width}`,
        ).toBeLessThanOrEqual(8);
      } else {
        expect(
          overflowPx,
          `phone overflow residual=${overflowPx}`,
        ).toBeLessThan(120);
      }
    }
  });
});
