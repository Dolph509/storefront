import type { SponsoredListingAd } from "@spree/sdk";
import {
  discoveryHrefFromSponsoredClick,
  type SponsoredClickDiscovery,
} from "@/lib/ads/sponsored-discovery-url";
import { getOrCreateTrafficSessionToken } from "@/lib/traffic/tokens";

const recordedImpressionTokens = new Set<string>();

function apiBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_SPREE_API_URL?.replace(/\/$/, "");
  if (publicUrl) return `${publicUrl}/api/v3`;
  return "/api/v3";
}

function publishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SPREE_PUBLISHABLE_KEY;
}

function adsHeaders(): HeadersInit | null {
  const key = publishableKey();
  if (!key) return null;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Spree-API-Key": key,
    "X-Spree-Session-Token": getOrCreateTrafficSessionToken(),
  };
  return headers;
}

export function recordSponsoredImpression(impressionToken: string): void {
  if (!impressionToken || recordedImpressionTokens.has(impressionToken)) return;
  const headers = adsHeaders();
  if (!headers) return;
  recordedImpressionTokens.add(impressionToken);
  void fetch(`${apiBaseUrl()}/store/advertising/impressions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ impression_token: impressionToken }),
    credentials: "include",
    keepalive: true,
  }).catch(() => {
    recordedImpressionTokens.delete(impressionToken);
  });
}

export type SponsoredClickResponse = {
  id: string;
  billable: boolean;
  discovery: SponsoredClickDiscovery;
};

export async function recordSponsoredClick(
  clickToken: string,
): Promise<SponsoredClickResponse | null> {
  const headers = adsHeaders();
  if (!headers || !clickToken) return null;
  try {
    const response = await fetch(`${apiBaseUrl()}/store/advertising/clicks`, {
      method: "POST",
      headers,
      body: JSON.stringify({ click_token: clickToken }),
      credentials: "include",
    });
    if (!response.ok) return null;
    return (await response.json()) as SponsoredClickResponse;
  } catch {
    return null;
  }
}

export async function sponsoredProductNavigateHref(
  basePath: string,
  productSlug: string,
  ad: SponsoredListingAd,
): Promise<string> {
  const click = await recordSponsoredClick(ad.click_token);
  if (!click?.discovery) {
    return `${basePath}/products/${productSlug}`;
  }
  return discoveryHrefFromSponsoredClick(
    basePath,
    productSlug,
    click.discovery,
  );
}

/** Test-only reset */
export function resetSponsoredImpressionDedupeForTests(): void {
  recordedImpressionTokens.clear();
}
