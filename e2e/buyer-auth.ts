import { expect, type Page } from "@playwright/test";

/**
 * Signs in through the account form and waits until the authenticated shell is ready.
 */
export async function loginBuyerThroughAccountForm(
  page: Page,
  email: string,
  password: string,
) {
  await page.goto("/us/en/account");
  const emailField = page.getByLabel(/^email$/i);
  await expect(emailField).toBeVisible({ timeout: 20_000 });
  await emailField.fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await expect(
    page.getByRole("heading", { name: /account overview/i }),
  ).toBeVisible({ timeout: 30_000 });
}
