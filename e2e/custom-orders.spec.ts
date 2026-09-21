import { expect, test } from "@playwright/test";

test.describe("custom orders", () => {
  test("buyer can trace a seeded request to its private listing", async ({
    page,
  }) => {
    test.skip(
      !process.env.SPREE_E2E_CUSTOM_ORDER_ID,
      "Set SPREE_E2E_CUSTOM_ORDER_ID after seeding the marketplace dataset",
    );

    await page.goto(
      `/us/en/account/custom-orders/${process.env.SPREE_E2E_CUSTOM_ORDER_ID}`,
    );
    await expect(page.getByText(/Custom order/i).first()).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: /Open conversation|View custom listing/i,
      }),
    ).toBeVisible();
  });

  test("private listing is not exposed to an unauthenticated visitor", async ({
    page,
  }) => {
    test.skip(
      !process.env.SPREE_E2E_PRIVATE_LISTING_ID,
      "Set SPREE_E2E_PRIVATE_LISTING_ID after seeding the marketplace dataset",
    );

    await page.goto(
      `/us/en/products/private/${process.env.SPREE_E2E_PRIVATE_LISTING_ID}`,
    );
    await expect(page).toHaveURL(/\/account\?returnTo=/);
  });
});
