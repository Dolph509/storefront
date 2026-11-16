import type * as React from "react";

/**
 * Skeleton placeholder for a single product card.
 * Matches the layout of `<ProductCard>` — no border, rounded image,
 * text placeholders below.
 */
export function ProductCardSkeleton(): React.JSX.Element {
  return (
    <div className="min-w-0 animate-pulse" aria-hidden="true">
      <div className="aspect-[var(--marketplace-product-image-ratio)] rounded-[var(--marketplace-product-card-radius)] bg-marketplace-surface-subtle" />
      <div className="space-y-2 pt-3">
        <div className="h-3 w-2/5 rounded bg-marketplace-surface-subtle" />
        <div className="h-4 w-4/5 rounded bg-marketplace-surface-subtle" />
        <div className="h-4 w-1/3 rounded bg-marketplace-surface-subtle" />
      </div>
    </div>
  );
}
