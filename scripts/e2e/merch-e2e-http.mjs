/**
 * HTTP helpers for localhost merchandising E2E (Rails dev endpoint).
 */
import { merchApiBaseUrl } from "./merch-e2e-env.mjs";

export async function postMerchDev(action) {
  const apiOrigin = merchApiBaseUrl();
  const response = await fetch(
    `${apiOrigin}/api/v3/dev/merchandising_e2e/${action}`,
    { method: "POST", headers: { "Content-Type": "application/json" } },
  );
  if (!response.ok) {
    throw new Error(
      `Merchandising dev ${action} failed (${response.status}): ${await response.text()}`,
    );
  }
}
