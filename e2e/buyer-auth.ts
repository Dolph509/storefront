import { expect, type Page } from "@playwright/test";
import { storefrontGoto } from "./marketplace-fixtures";

/**
 * Signs in through the account form and waits until the authenticated shell is ready.
 */
export async function loginBuyerThroughAccountForm(
  page: Page,
  email: string,
  password: string,
) {
  await storefrontGoto(page, "/us/en/account");
  const emailField = page.getByLabel(/^email$/i);
  await expect(emailField).toBeVisible({ timeout: 20_000 });
  await emailField.fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await expect(
    page.getByRole("heading", { name: /account overview/i }),
  ).toBeVisible({ timeout: 30_000 });
}

/**
 * Signs in through the Store API and waits for the storefront session to settle.
 */
export async function loginBuyerViaApi(
  page: Page,
  email: string,
  password: string,
) {
  const response = await page.request.post("/api/v3/store/auth/login", {
    data: { email, password },
  });
  if (!response.ok()) {
    throw new Error(
      `Buyer API login failed with ${response.status()}: ${await response.text()}`,
    );
  }

  await storefrontGoto(page, "/us/en/account");
  await expect(
    page.getByRole("heading", { name: /account overview/i }),
  ).toBeVisible({ timeout: 30_000 });
}

export async function logoutBuyer(page: Page) {
  await storefrontGoto(page, "/us/en/account");
  const signOut = page.getByRole("button", { name: /sign out|log out/i });
  if (await signOut.isVisible().catch(() => false)) {
    await signOut.click();
  }
}
