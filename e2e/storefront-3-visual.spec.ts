import { expect, test } from "@playwright/test";
import {
  ensureSellerStorefrontDataset,
  MARKETPLACE_BUYER_EMAIL,
  MARKETPLACE_BUYER_PASSWORD,
  SELLER_A_PRODUCT_PATH,
  SELLER_A_SHOP_PATH,
} from "./marketplace-fixtures";

const pages = [
  ["home", "/us/en"],
  ["seller", SELLER_A_SHOP_PATH],
  ["product", SELLER_A_PRODUCT_PATH],
  ["messages", "/us/en/account/messages"],
  ["cart", "/us/en/cart"],
] as const;

test("Storefront 3 visual sweep", async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  await ensureSellerStorefrontDataset(page);
  await page.goto("/us/en/account");
  await page.getByLabel(/^email$/i).fill(MARKETPLACE_BUYER_EMAIL);
  await page.getByLabel(/^password$/i).fill(MARKETPLACE_BUYER_PASSWORD);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await expect(page.getByText(MARKETPLACE_BUYER_EMAIL).last()).toBeVisible({
    timeout: 20_000,
  });

  for (const [name, path] of pages) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("banner")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath(`desktop-${name}.png`),
      fullPage: true,
    });

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("navigation", { name: /marketplace navigation/i }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: testInfo.outputPath(`mobile-${name}.png`),
      fullPage: true,
    });
  }

  await page.goto("/us/en");
  await page.getByRole("button", { name: /open search/i }).click();
  await expect(page.getByRole("combobox", { name: /search/i })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("mobile-search.png"),
    fullPage: false,
  });
  await page.getByRole("button", { name: /close search/i }).click();
  await page
    .getByRole("navigation", { name: /marketplace navigation/i })
    .getByRole("button", { name: /open menu/i })
    .click();
  await expect(page.getByRole("dialog", { name: /menu/i })).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: /menu/i }).getByRole("link", {
      name: /^home$/i,
    }),
  ).toBeVisible();
  await page.waitForTimeout(350);
  await page.screenshot({
    path: testInfo.outputPath("mobile-browse.png"),
    fullPage: false,
  });

  for (const width of [768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/us/en");
    await expect(page.getByRole("banner")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});

async function expectNoHorizontalOverflow(
  page: import("@playwright/test").Page,
) {
  const result = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    outliers: Array.from(document.querySelectorAll("body *"))
      .map((element) => ({
        element: element.tagName,
        className: element.getAttribute("class"),
        right: element.getBoundingClientRect().right,
      }))
      .filter((element) => element.right > window.innerWidth + 1)
      .slice(0, 5),
  }));
  expect(result.overflow, JSON.stringify(result.outliers)).toBeLessThanOrEqual(
    1,
  );
}
