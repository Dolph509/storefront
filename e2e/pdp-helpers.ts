import { expect, type Page } from "@playwright/test";

/**
 * Satisfies required personalization controls on the PDP when present.
 */
export async function completeRequiredPersonalization(page: Page) {
  const fontChoice = page
    .getByRole("radio", { name: /modern|script|serif/i })
    .first();
  if (await fontChoice.isVisible().catch(() => false)) {
    await fontChoice.click({ force: true });
  }

  const swatch = page
    .getByRole("radio", { name: /natural|walnut|black/i })
    .first();
  if (await swatch.isVisible().catch(() => false)) {
    await swatch.click({ force: true });
  }

  const dropdown = page.getByRole("combobox").first();
  if (await dropdown.isVisible().catch(() => false)) {
    await dropdown.click();
    const option = page.getByRole("option").first();
    if (await option.isVisible().catch(() => false)) {
      await option.click();
    }
  }

  const validationAlert = page.getByRole("alert").filter({
    hasText: /choose an option|required|personalize/i,
  });
  if (await validationAlert.isVisible().catch(() => false)) {
    const fallbackRadio = page.getByRole("radio").first();
    if (await fallbackRadio.isVisible().catch(() => false)) {
      await fallbackRadio.click({ force: true });
    }
  }
}

export async function addProductToCart(page: Page, path: string) {
  await page.goto(path);
  await completeRequiredPersonalization(page);
  const add = page.getByRole("button", { name: /add to cart/i });
  await expect(add).toBeEnabled({ timeout: 15_000 });
  await add.click();
  const cartDialog = page.getByRole("dialog", { name: /cart/i });
  if (!(await cartDialog.isVisible().catch(() => false))) {
    await page.getByRole("button", { name: /open cart/i }).click();
  }
  await expect(cartDialog).toBeVisible({ timeout: 30_000 });
}
