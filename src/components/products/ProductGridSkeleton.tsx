import { ProductCardSkeleton } from "./ProductCardSkeleton";

export function ProductGridSkeleton() {
  return (
    <div className="theme-product-grid grid">
      {[...Array(6)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
