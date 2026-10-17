"use client";

import type { Product } from "@spree/sdk";
import { useEffect } from "react";
import {
  type RecommendationSurface,
  trackRecommendationImpression,
} from "@/lib/analytics/recommendation-attribution";

export function RecommendationListAnalytics({
  products,
  listId,
  listName,
  currency = "USD",
  surface,
  personalized,
  experiment,
}: {
  products: Product[];
  listId: string;
  listName: string;
  currency?: string;
  surface: RecommendationSurface;
  personalized: boolean;
  experiment?: string | null;
}) {
  useEffect(() => {
    trackRecommendationImpression({
      products,
      listId,
      listName,
      currency,
      surface,
      personalized,
      experiment,
    });
  }, [products, listId, listName, currency, surface, personalized, experiment]);

  return null;
}
