import { expect, type Page } from "@playwright/test";

/**
 * Satisfies required personalization controls on the PDP when present.
 */
export async function completeRequiredPersonalization(page: Page) {
  const engraving = page.getByRole("checkbox", { name: /add engraving/i });
  if (await engraving.isVisible().catch(() => false)) {
    await engraving.check();
  }

  const engravingText = page.getByLabel(/name to engrave/i);
  if (await engravingText.isVisible().catch(() => false)) {
    await engravingText.fill("Beta buyer");
  }

  const upload = page.locator('input[type="file"]');
  if (await upload.count()) {
    await upload.first().setInputFiles({
      name: "beta-personalization.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
        "base64",
      ),
    });
    await expect(
      page.getByText(/uploaded: beta-personalization\.png/i),
    ).toBeVisible({
      timeout: 30_000,
    });
  }

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
  await expect(page.getByRole("link", { name: /^sign in$/i })).toHaveCount(0, {
    timeout: 10_000,
  });
  await completeRequiredPersonalization(page);
  const add = page.getByRole("button", { name: /add to cart/i });
  await expect(add).toBeEnabled({ timeout: 15_000 });
  const addResponse = page
    .waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        /cart|line_item|items/i.test(response.url()),
      { timeout: 30_000 },
    )
    .catch(() => null);
  await add.click();
  const response = await addResponse;
  const cartDialog = page.getByRole("dialog", { name: /cart/i });
  if (!(await cartDialog.isVisible().catch(() => false))) {
    await page.getByRole("button", { name: /open cart/i }).click();
  }
  if (!(await cartDialog.isVisible().catch(() => false))) {
    const body = await page.locator("body").innerText();
    const responseBody = response ? await response.text().catch(() => "") : "";
    throw new Error(
      `Add-to-cart did not open the cart dialog. Status=${response?.status() ?? "no matching response"}; response=${responseBody.slice(0, 1200)}; page=${body.slice(-1600)}`,
    );
  }
}
