import type { Product } from "@spree/sdk";
import { ProductCard } from "@/components/products/ProductCard";

interface HomeProductGridProps {
  products: Product[];
  basePath: string;
  currency?: string;
  listId: string;
  listName: string;
  limit?: number;
}

export function HomeProductGrid({
  products,
  basePath,
  currency,
  listId,
  listName,
  limit = 5,
}: HomeProductGridProps) {
  const slice = products.slice(0, limit);
  if (!slice.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4">
      {slice.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          basePath={basePath}
          currency={currency}
          listId={listId}
          listName={listName}
          index={index}
          density="standard"
        />
      ))}
    </div>
  );
}
