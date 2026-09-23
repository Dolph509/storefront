import { expect, test } from "@playwright/test";
import {
  ensureSellerStorefrontDataset,
  MARKETPLACE_BUYER_EMAIL,
  MARKETPLACE_BUYER_PASSWORD,
  SELLER_A_SHOP_PATH,
} from "./marketplace-fixtures";

test("Storefront 3 marketplace shell stays usable across desktop and mobile", async ({
  page,
}) => {
  await ensureSellerStorefrontDataset(page);
  await page.goto("/us/en");

  const header = page.getByRole("banner");
  await expect(header.getByRole("combobox", { name: /search/i })).toBeVisible();
  await page
    .getByRole("navigation", { name: /category navigation/i })
    .getByRole("link")
    .first()
    .click();
  await expect(page).toHaveURL(/\/(c\/|products|shops)/);

  await expect(header.getByRole("link", { name: /favorites/i })).toBeVisible();
  await expect(
    header.getByRole("link", { name: /sign in|account/i }),
  ).toBeVisible();
  await expect(header.getByRole("link", { name: /messages/i })).toBeVisible();
  await header.getByRole("button", { name: /open cart/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");

  await page.goto("/us/en/account");
  await page.getByLabel(/^email$/i).fill(MARKETPLACE_BUYER_EMAIL);
  await page.getByLabel(/^password$/i).fill(MARKETPLACE_BUYER_PASSWORD);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await expect(page.getByText(MARKETPLACE_BUYER_EMAIL).last()).toBeVisible({
    timeout: 20_000,
  });
  await page.goto("/us/en/account/messages");
  await expect(page).toHaveURL(/\/account\/messages/);

  await page.goto(SELLER_A_SHOP_PATH);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const footer = page.getByRole("contentinfo");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer.getByRole("heading", { name: /shop/i })).toBeVisible();
  await expect(footer.getByText(/github|quickstart/i)).toHaveCount(0);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/us/en");
  const mobileNavigation = page.getByRole("navigation", {
    name: /marketplace navigation/i,
  });
  await expect(mobileNavigation).toBeVisible();
  await expect(mobileNavigation.locator(":scope > div > *")).toHaveCount(5);
  await mobileNavigation.getByRole("button", { name: /open menu/i }).click();
  await expect(page.getByRole("dialog", { name: /menu/i })).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: /menu/i }).getByRole("link", {
      name: /^home$/i,
    }),
  ).toBeVisible();
});
