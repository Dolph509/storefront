import { expect, test } from "@playwright/test";

test("browse the native homepage, a listing and its maker", async ({
  page,
}, info) => {
  await page.goto("/us/en", { waitUntil: "domcontentloaded" });
  const home = page.locator("[data-native-marketplace-home]");
  await expect(home.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 45_000,
  });
  await home
    .locator("section")
    .first()
    .locator("img")
    .evaluate(async (img: HTMLImageElement) => img.decode());
  await page.screenshot({
    path: info.outputPath("homepage.png"),
    animations: "disabled",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await home.locator("section").first().getByRole("link").first().click();
  const listing = page.locator('main a[href*="/products/"]').first();
  await expect(listing).toBeVisible({ timeout: 45_000 });
  await listing.click();
  const product = page.locator("[data-theme-product-page]");
  await expect(product).toBeVisible({ timeout: 45_000 });
  await page.screenshot({
    path: info.outputPath("product.png"),
    animations: "disabled",
  });
  const maker = product.locator('a[href*="/sellers/"]:visible').first();
  await maker.click();
  await expect(page.locator("[data-seller-shop-header]")).toBeVisible({
    timeout: 45_000,
  });
  await page.screenshot({
    path: info.outputPath("shop.png"),
    animations: "disabled",
  });
});
