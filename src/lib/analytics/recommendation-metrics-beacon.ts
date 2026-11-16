import type { RecommendationSurface } from "@/lib/analytics/recommendation-attribution";
import {
  getOrCreateTrafficSessionToken,
  getOrCreateTrafficVisitorToken,
} from "@/lib/traffic/tokens";

export type RecommendationMetricEvent = {
  kind: "impression" | "click";
  surface: RecommendationSurface | string;
  list_id: string;
  product_id?: string;
  personalized?: boolean;
  experiment_variant?: string | null;
  position?: number;
  seller_id?: string;
};

function apiBaseUrl(): string {
  const publicUrl = process.env.NEXT_PUBLIC_SPREE_API_URL?.replace(/\/$/, "");
  if (publicUrl) return `${publicUrl}/api/v3`;
  return "/api/v3";
}

function publishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SPREE_PUBLISHABLE_KEY;
}

export function sendRecommendationMetricEvents(
  events: RecommendationMetricEvent[],
): void {
  if (!events.length || typeof window === "undefined") return;

  const key = publishableKey();
  if (!key) return;

  const body = {
    session_token: getOrCreateTrafficSessionToken(),
    visitor_token: getOrCreateTrafficVisitorToken(),
    events,
  };

  void fetch(`${apiBaseUrl()}/store/recommendation_metrics/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Spree-API-Key": key,
    },
    body: JSON.stringify(body),
    keepalive: true,
    credentials: "include",
  }).catch(() => {
    // Analytics must not break the storefront.
  });
}
