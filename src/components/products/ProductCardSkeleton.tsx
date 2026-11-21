import type * as React from "react";

export function ProductCardSkeleton(): React.JSX.Element {
  return (
    <div className="min-w-0 animate-pulse" aria-hidden="true">
      <div className="aspect-[var(--marketplace-product-image-ratio,4/5)] rounded-[var(--marketplace-product-card-radius)] border border-marketplace-border-subtle bg-marketplace-surface-subtle" />
      <div className="space-y-2 pt-3">
        <div className="h-3 w-2/5 rounded-xs bg-marketplace-surface-subtle" />
        <div className="h-4 w-4/5 rounded-xs bg-marketplace-surface-subtle" />
        <div className="h-4 w-1/3 rounded-xs bg-marketplace-surface-subtle" />
      </div>
    </div>
  );
}
