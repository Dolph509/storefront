import { expect, test } from "@playwright/test";
import { loginBuyerThroughAccountForm } from "./buyer-auth";
import {
  ensureSellerStorefrontDataset,
  MARKETPLACE_BUYER_EMAIL,
  MARKETPLACE_BUYER_PASSWORD,
  prepareStorefrontPage,
  SELLER_A_SHOP_PATH,
  storefrontGoto,
} from "./marketplace-fixtures";

test("Storefront 3 marketplace shell stays usable across desktop and mobile", async ({
  page,
}) => {
  test.setTimeout(300_000);
  await prepareStorefrontPage(page);
  await ensureSellerStorefrontDataset(page);
  await storefrontGoto(page, "/us/en");

  const header = page.getByRole("banner");
  await expect(header.getByRole("combobox", { name: /search/i })).toBeVisible();
  await expect(
    header.getByRole("link", { name: /spree store/i }),
  ).toBeVisible();

  const categoryNav = header.getByRole("navigation", {
    name: /category navigation/i,
  });
  const categoryLink = categoryNav.getByRole("link").first();
  const categoryLinkVisible = await categoryLink
    .isVisible({ timeout: 5_000 })
    .catch(() => false);
  if (categoryLinkVisible) {
    await categoryLink.click();
    await expect(page).toHaveURL(/\/(c\/|products|shops)/);
    await storefrontGoto(page, "/us/en");
  } else {
    await storefrontGoto(page, "/us/en/shops");
    await expect(page).toHaveURL(/\/shops/);
    await storefrontGoto(page, "/us/en");
  }

  await expect(header.getByRole("link", { name: /favorites/i })).toBeVisible();
  await expect(
    header.getByRole("link", { name: /sign in|account/i }),
  ).toBeVisible();
  await expect(header.getByRole("link", { name: /messages/i })).toBeVisible();
  await header.getByRole("button", { name: /open cart/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 375, height: 812 });
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
  await expect(
    page.getByRole("dialog", { name: /menu/i }).getByRole("link", {
      name: /^shops$/i,
    }),
  ).toBeVisible();
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 1280, height: 800 });

  await loginBuyerThroughAccountForm(
    page,
    MARKETPLACE_BUYER_EMAIL,
    MARKETPLACE_BUYER_PASSWORD,
  );
  await expect(
    page.getByRole("banner").getByRole("link", { name: /messages/i }),
  ).toHaveAttribute("href", /\/account\/messages/);
  await storefrontGoto(page, "/us/en/account/messages");
  await expect(page).toHaveURL(/\/account\/messages/);

  await storefrontGoto(page, SELLER_A_SHOP_PATH);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const footer = page.getByRole("contentinfo");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer.getByRole("heading", { name: /shop/i })).toBeVisible();
  await expect(footer.getByText(/github|quickstart/i)).toHaveCount(0);
});
