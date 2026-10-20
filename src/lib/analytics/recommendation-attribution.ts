import type { Product } from "@spree/sdk";
import { trackViewItemList } from "@/lib/analytics/gtm";
import { sendRecommendationMetricEvents } from "@/lib/analytics/recommendation-metrics-beacon";

const impressionKeys = new Set<string>();
const clickKeys = new Set<string>();

export type RecommendationSurface =
  | "home_rail"
  | "category"
  | "collection"
  | "pdp"
  | "cart"
  | "favorites"
  | "seller_shop"
  | "account";

export function trackRecommendationImpression(input: {
  products: Product[];
  listId: string;
  listName: string;
  currency: string;
  surface: RecommendationSurface;
  personalized: boolean;
  experiment?: string | null;
}): void {
  if (!input.products.length) return;

  const key = [
    input.surface,
    input.listId,
    input.personalized ? "1" : "0",
    input.products.map((product) => product.id).join(","),
  ].join(":");
  if (impressionKeys.has(key)) return;
  impressionKeys.add(key);

  trackViewItemList(
    input.products,
    input.listId,
    input.listName,
    input.currency,
  );

  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({
      event: "spree_recommendation_impression",
      recommendation_surface: input.surface,
      recommendation_list_id: input.listId,
      recommendation_personalized: input.personalized,
      recommendation_experiment: input.experiment ?? undefined,
      recommendation_product_count: input.products.length,
    });
  }

  sendRecommendationMetricEvents(
    input.products.map((product, index) => ({
      kind: "impression",
      surface: input.surface,
      list_id: input.listId,
      product_id: product.id,
      personalized: input.personalized,
      experiment_variant: input.experiment ?? undefined,
      position: index + 1,
      seller_id: product.seller?.id,
    })),
  );
}

export function trackRecommendationClick(input: {
  productId: string;
  surface: RecommendationSurface | string;
  listId: string;
  personalized?: boolean;
  experiment?: string | null;
  position?: number;
}): void {
  const dedupeKey = [
    input.surface,
    input.listId,
    input.productId,
    input.position ?? "",
  ].join(":");
  if (clickKeys.has(dedupeKey)) return;
  clickKeys.add(dedupeKey);

  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({
      event: "spree_recommendation_click",
      recommendation_surface: input.surface,
      recommendation_list_id: input.listId,
      recommendation_personalized: input.personalized ?? false,
      recommendation_experiment: input.experiment ?? undefined,
      product_id: input.productId,
    });
  }

  sendRecommendationMetricEvents([
    {
      kind: "click",
      surface: input.surface,
      list_id: input.listId,
      product_id: input.productId,
      personalized: input.personalized,
      experiment_variant: input.experiment ?? undefined,
      position: input.position,
    },
  ]);
}

/** @internal Test-only reset for in-memory dedupe sets. */
export function resetRecommendationAttributionDedupeForTests(): void {
  impressionKeys.clear();
  clickKeys.clear();
}

export function trackRecommendationDismiss(input: {
  productId: string;
  surface: string;
  listId?: string;
}): void {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({
      event: "spree_recommendation_dismiss",
      recommendation_surface: input.surface,
      recommendation_list_id: input.listId,
      product_id: input.productId,
    });
  }
}
