import { expect, test } from "@playwright/test";

/**
 * Seeded OrderProof flow. Skips when the marketplace dataset has not
 * provisioned a proof-required completed order for the storefront buyer.
 */
test.describe("order proofs", () => {
  test("buyer can open a proof-required order and see proof status", async ({
    page,
  }) => {
    test.skip(
      !process.env.SPREE_E2E_PROOF_ORDER_ID,
      "Set SPREE_E2E_PROOF_ORDER_ID to a seeded proof-required order id",
    );

    const orderId = process.env.SPREE_E2E_PROOF_ORDER_ID!;
    await page.goto(`/us/en/account/orders/${orderId}`);
    await expect(
      page.getByText(/Proof approval|Proof required|Proof #/i).first(),
    ).toBeVisible({
      timeout: 15_000,
    });
  });
});
