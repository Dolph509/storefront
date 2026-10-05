import type { Page } from "@playwright/test";
import { loadSpreeEnv } from "./store-cart";

async function readBuyerJwt(page: Page): Promise<string> {
  const cookies = await page.context().cookies();
  const jwt = cookies.find((cookie) => cookie.name === "_spree_jwt")?.value;
  if (!jwt) {
    throw new Error("Buyer JWT cookie missing. Call loginBuyerViaApi first.");
  }
  return jwt;
}

function normalizeStorePath(path: string): string {
  const trimmed = path.replace(/^\//, "");
  if (trimmed.startsWith("api/v3/store/")) {
    return trimmed.slice("api/v3/store/".length);
  }
  return trimmed;
}

/** Authenticated Store API request against Rails (not the Next.js origin). */
export async function storeApiFetch(
  page: Page,
  method: "GET" | "PATCH" | "POST",
  path: string,
  data?: Record<string, unknown>,
) {
  const { storeApiBaseUrl, publishableKey } = loadSpreeEnv();
  const jwt = await readBuyerJwt(page);
  const relativePath = normalizeStorePath(path);
  const url = `${storeApiBaseUrl.replace(/\/$/, "")}/${relativePath.replace(/^\//, "")}`;
  return fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Spree-API-Key": publishableKey,
      Authorization: `Bearer ${jwt}`,
    },
    body: data ? JSON.stringify(data) : undefined,
  });
}
