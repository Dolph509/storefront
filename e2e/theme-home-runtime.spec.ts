import { expect, test } from "@playwright/test";
import { ensureSellerStorefrontDataset } from "./marketplace-fixtures";

test("Theme home runtime falls back to legacy home without flag", async ({
  page,
}) => {
  await ensureSellerStorefrontDataset(page);
  await page.goto("/us/en");
  await expect(page.getByRole("banner")).toBeVisible();
});
