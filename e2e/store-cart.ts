import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@playwright/test";
import { createClient } from "@spree/sdk";
import { MARKETPLACE_E2E_REQUIRED } from "./marketplace-fixtures";

export type DiscoveryAttribution = {
  source_type: string;
  list_id?: string | null;
  position?: number | null;
  section?: string | null;
  seller_id?: string | null;
  product_id?: string | null;
};

export type CartLineItem = {
  id: string;
  name?: string;
  variant_id?: string;
  product_id?: string;
  discovery_attribution?: DiscoveryAttribution;
};

export type StoreCart = {
  id: string;
  items?: CartLineItem[];
};

function loadSpreeEnv(): { baseUrl: string; publishableKey: string } {
  const fromEnv =
    process.env.SPREE_API_URL && process.env.SPREE_PUBLISHABLE_KEY;
  if (fromEnv) {
    return {
      baseUrl: process.env.SPREE_API_URL!,
      publishableKey: process.env.SPREE_PUBLISHABLE_KEY!,
    };
  }

  const envPath = join(__dirname, "..", ".env.e2e");
  if (!existsSync(envPath)) {
    const message =
      "Missing SPREE_API_URL / SPREE_PUBLISHABLE_KEY (set env or run pnpm run e2e:up).";
    if (MARKETPLACE_E2E_REQUIRED) throw new Error(message);
    throw new Error(message);
  }

  const lines = readFileSync(envPath, "utf8").split("\n");
  const vars: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq)] = trimmed
      .slice(eq + 1)
      .replace(/^["']|["']$/g, "");
  }

  if (!vars.SPREE_API_URL || !vars.SPREE_PUBLISHABLE_KEY) {
    throw new Error(`Incomplete ${envPath}`);
  }

  return {
    baseUrl: vars.SPREE_API_URL,
    publishableKey: vars.SPREE_PUBLISHABLE_KEY,
  };
}

function cartCookies(page: Page) {
  return page.context().cookies();
}

/** Current DTC cart from Store API (uses browser session cookies). */
export async function fetchStoreCart(page: Page): Promise<StoreCart> {
  const { baseUrl, publishableKey } = loadSpreeEnv();
  const cookies = await cartCookies(page);
  const jwt = cookies.find((c) => c.name === "_spree_jwt")?.value;
  const spreeToken = cookies.find((c) => c.name === "_spree_cart_token")?.value;
  const cartId = cookies.find((c) => c.name === "_spree_cart_token_id")?.value;

  if (!cartId) {
    throw new Error(
      "No cart id cookie (_spree_cart_token_id) — add to cart first.",
    );
  }

  const client = createClient({ baseUrl, publishableKey });
  const cart = await client.carts.get(cartId, {
    token: jwt,
    spreeToken,
  });

  return cart as StoreCart;
}

export function findLineByListId(
  cart: StoreCart,
  listId: string,
): CartLineItem | undefined {
  return cart.items?.find(
    (line) => line.discovery_attribution?.list_id === listId,
  );
}

export function assertSellerShopAttribution(
  line: CartLineItem,
  options: {
    listId?: string;
    sectionSlug?: string;
    sellerIdFromUrl?: string;
  },
): void {
  const attr = line.discovery_attribution;
  if (!attr) {
    throw new Error(`Line ${line.id} missing discovery_attribution`);
  }
  if (attr.source_type !== "seller_shop") {
    throw new Error(
      `Expected source_type seller_shop, got ${attr.source_type ?? "null"}`,
    );
  }
  if (options.listId && attr.list_id !== options.listId) {
    throw new Error(
      `Expected list_id ${options.listId}, got ${attr.list_id ?? "null"}`,
    );
  }
  if (options.sectionSlug && attr.section !== options.sectionSlug) {
    throw new Error(
      `Expected section ${options.sectionSlug}, got ${attr.section ?? "null"}`,
    );
  }
  if (options.sellerIdFromUrl && attr.seller_id) {
    if (attr.seller_id !== options.sellerIdFromUrl) {
      throw new Error(
        `seller_id ${attr.seller_id} does not match PDP seller ${options.sellerIdFromUrl}`,
      );
    }
  }
  if (!attr.product_id) {
    throw new Error("discovery_attribution.product_id missing on cart line");
  }
}

export function sellerIdFromPdpUrl(url: string): string | undefined {
  const match = url.match(/[?&]seller_id=([^&]+)/);
  return match?.[1];
}

export function listIdFromPdpUrl(url: string): string | undefined {
  const match = url.match(/[?&]list_id=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}
