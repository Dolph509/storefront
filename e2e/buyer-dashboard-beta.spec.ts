/**
 * Focused buyer dashboard beta closure suite.
 *
 *   pnpm exec playwright test e2e/buyer-dashboard-beta.spec.ts --workers=1
 *
 * Provider-dependent paths (SMS, OAuth, Stripe setup) assert graceful degrade
 * only — they do not require external providers to succeed.
 */

import {
  expectBuyerSessionCookies,
  loginBuyerThroughAccountForm,
} from "./buyer-auth";
import { expect, test } from "./buyer-desktop-evidence";
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
  await expect(content).not.toHaveText(/^Loading\.\.\.$/, { timeout: 120_000 });
  await expect(content).not.toContainText(/loading profile/i, {
    timeout: 120_000,
  });
  await expect(content).toContainText(marker, { timeout: 120_000 });
}

async function openSettingsTab(
  page: import("@playwright/test").Page,
  path: string,
) {
  await storefrontGoto(page, path, { waitUntil: "load" });
  await expect(page).toHaveURL(
    new RegExp(`${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/?$`),
  );
}

test.describe("buyer dashboard beta", () => {
  test.describe.configure({ timeout: 600_000 });

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
    await expectBuyerSessionCookies(page);

    await storefrontGoto(page, "/us/en/account/settings/account");
    await expect(
      page.getByRole("heading", { name: /account settings/i }),
    ).toBeVisible({ timeout: 120_000 });
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
      await openSettingsTab(page, path);
      await expectSettingsContent(page, marker);
    }

    await openSettingsTab(page, "/us/en/account/settings/security");
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
      await page.goto(legacy.from, {
        waitUntil: "load",
        timeout: 180_000,
      });
      await expect(page).toHaveURL(legacy.to, { timeout: 60_000 });
    }
  });

  test("orders, messages, and responsive settings", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await prepareStorefrontPage(page);
    await loginBuyerThroughAccountForm(
      page,
      MARKETPLACE_BUYER_EMAIL,
      MARKETPLACE_BUYER_PASSWORD,
    );
    await expectBuyerSessionCookies(page);

    await storefrontGoto(page, "/us/en/account/orders", { waitUntil: "load" });
    const ordersMain = page.locator("main").last();
    await expect(ordersMain).not.toHaveText(/^Loading\.\.\.$/, {
      timeout: 120_000,
    });
    await expect(
      ordersMain.getByRole("heading", {
        level: 1,
        name: /^order history$/i,
      }),
    ).toBeVisible({ timeout: 120_000 });
    await page.screenshot({
      path: testInfo.outputPath("orders.png"),
      fullPage: true,
    });

    await page
      .getByRole("navigation", { name: /account/i })
      .getByRole("link", { name: /^messages$/i })
      .click();
    await expect(page).toHaveURL(/\/account\/messages/, { timeout: 60_000 });
    await expect(
      page.getByRole("heading", { level: 1, name: /^messages$/i }),
    ).toBeVisible({ timeout: 120_000 });
    await page.screenshot({
      path: testInfo.outputPath("messages.png"),
      fullPage: true,
    });

    await openSettingsTab(page, "/us/en/account/settings/account");
    await expectSettingsContent(page, /about you|member since/i);
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(
        page.getByRole("heading", { name: /about you/i }),
      ).toBeVisible({
        timeout: 120_000,
      });
      await page.screenshot({
        path: testInfo.outputPath(`settings-${width}.png`),
        fullPage: true,
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
