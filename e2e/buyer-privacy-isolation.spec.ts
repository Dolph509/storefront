import { loginBuyerThroughAccountForm } from "./buyer-auth";
import { expect, test } from "./buyer-desktop-evidence";
import {
  MERCH_BUYER_A_EMAIL,
  MERCH_BUYER_B_EMAIL,
  MERCH_BUYER_PASSWORD,
  savePrivacySettings,
  storefrontGoto,
} from "./marketplace-fixtures";
import { storeApiFetch } from "./store-api";

test("advertising consent persists independently and stays isolated between buyers", async ({
  page,
  browser,
}, testInfo) => {
  expect(process.env.SPREE_API_URL).toBe("http://127.0.0.1:3011");
  await loginBuyerThroughAccountForm(
    page,
    MERCH_BUYER_A_EMAIL,
    MERCH_BUYER_PASSWORD,
  );
  const originalA = await (
    await storeApiFetch(page, "GET", "customers/me")
  ).json();
  expect(originalA.email).toBe(MERCH_BUYER_A_EMAIL);
  const otherContext = await browser.newContext({
    baseURL: new URL(page.url()).origin,
  });
  const otherPage = await otherContext.newPage();
  try {
    await loginBuyerThroughAccountForm(
      otherPage,
      MERCH_BUYER_B_EMAIL,
      MERCH_BUYER_PASSWORD,
    );
    const originalB = await (
      await storeApiFetch(otherPage, "GET", "customers/me")
    ).json();
    expect(originalB.email).toBe(MERCH_BUYER_B_EMAIL);
    await storefrontGoto(page, "/us/en/account/settings/privacy");
    const advertising = page.getByRole("checkbox", {
      name: /^personalized advertising/i,
    });
    const recommendations = page.getByRole("checkbox", {
      name: /^personalized recommendations/i,
    });
    await recommendations.setChecked(true);
    await advertising.setChecked(!originalA.behavioral_advertising_enabled);
    await savePrivacySettings(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(advertising).toBeChecked({
      checked: !originalA.behavioral_advertising_enabled,
    });
    await expect(recommendations).toBeChecked();
    await storefrontGoto(otherPage, "/us/en/account/settings/privacy");
    await expect(
      otherPage.getByRole("checkbox", { name: /^personalized advertising/i }),
    ).toBeChecked({ checked: originalB.behavioral_advertising_enabled });
    const afterB = await (
      await storeApiFetch(otherPage, "GET", "customers/me")
    ).json();
    expect(afterB.personalization_enabled).toBe(
      originalB.personalization_enabled,
    );
    expect(afterB.behavioral_advertising_enabled).toBe(
      originalB.behavioral_advertising_enabled,
    );
    await page.screenshot({
      path: testInfo.outputPath("advertising-consent.png"),
      fullPage: true,
    });
  } finally {
    const restored = await storeApiFetch(page, "PATCH", "customers/me", {
      personalization_enabled: originalA.personalization_enabled,
      behavioral_advertising_enabled: originalA.behavioral_advertising_enabled,
    });
    expect(restored.ok).toBe(true);
    await otherContext.close();
  }
});
