import { expect, type Page } from "@playwright/test";
import { createClient } from "@spree/sdk";
import { storefrontGoto } from "./marketplace-fixtures";
import { loadSpreeEnv } from "./store-cart";

function storefrontOrigin(page: Page): string {
  const configured =
    process.env.MERCH_E2E_STOREFRONT_URL ||
    process.env.BASE_URL ||
    "http://localhost:3001";
  if (page.url() && !page.url().startsWith("about:")) {
    return new URL(page.url()).origin;
  }
  return configured.replace(/\/$/, "");
}

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
  const { baseUrl, publishableKey } = loadSpreeEnv();
  const client = createClient({ baseUrl, publishableKey });
  const result = await client.auth.login({ email, password });
  if ("mfa_required" in result) {
    throw new Error("Buyer MFA is not supported in merchandising E2E.");
  }

  const origin = storefrontOrigin(page);
  await page.context().addCookies([
    {
      name: "_spree_jwt",
      value: result.token,
      url: origin,
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "_spree_refresh_token",
      value: result.refresh_token,
      url: origin,
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

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
