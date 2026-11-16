"use client";

import type { Product } from "@spree/sdk";
import { useRouter } from "next/navigation";
import {
  type ComponentProps,
  useCallback,
  useMemo,
  useState,
  useTransition,
} from "react";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import { trackRecommendationDismiss } from "@/lib/analytics/recommendation-attribution";
import { dismissRecommendation } from "@/lib/data/storefront-personalization";

type CarouselProps = ComponentProps<typeof ProductCarousel>;

export function RecommendationDismissibleCarousel({
  products,
  dismissSurface,
  ...carouselProps
}: CarouselProps & {
  dismissSurface: string;
}) {
  const router = useRouter();
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const [pending, startTransition] = useTransition();

  const visibleProducts = useMemo(
    () => products.filter((product) => !hiddenIds.has(product.id)),
    [products, hiddenIds],
  );

  const onDismiss = useCallback(
    (product: Product) => {
      startTransition(async () => {
        const ok = await dismissRecommendation({
          subject_type: "product",
          subject_id: product.id,
          kind: "dismiss",
          surface: dismissSurface,
        });
        if (!ok) return;
        trackRecommendationDismiss({
          productId: product.id,
          surface: dismissSurface,
          listId: carouselProps.listId,
        });
        setHiddenIds((current) => new Set(current).add(product.id));
        router.refresh();
      });
    },
    [dismissSurface, router],
  );

  if (!visibleProducts.length) return null;

  return (
    <ProductCarousel
      {...carouselProps}
      products={visibleProducts}
      dismissibleRecommendations
      onDismissRecommendation={onDismiss}
      dismissing={pending}
    />
  );
}
