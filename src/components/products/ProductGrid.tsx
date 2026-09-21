import type { Product } from "@spree/sdk";
import {
  buildDiscoveryContext,
  withDiscoveryPosition,
} from "@/lib/discovery/discovery-analytics";
import type { ListDiscoveryOptions } from "@/lib/discovery/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  basePath?: string;
  categoryId?: string;
  listId?: string;
  listName?: string;
  listDiscovery?: ListDiscoveryOptions;
  discoveryPageKey?: string;
  emptyMessage?: string;
  priorityCount?: number;
  /** Optional currency used for analytics in each ProductCard. */
  currency?: string;
}

export function ProductGrid({
  products,
  basePath = "",
  categoryId,
  listId,
  listName,
  listDiscovery,
  discoveryPageKey,
  emptyMessage,
  priorityCount = 0,
  currency,
}: ProductGridProps) {
  const discoveryOptions: ListDiscoveryOptions | undefined =
    listDiscovery ?? (listId ? { listId, listName } : undefined);
  if (products.length === 0 && emptyMessage) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          basePath={basePath}
          categoryId={categoryId}
          index={index}
          listId={listId}
          listName={listName}
          fetchPriority={index < priorityCount ? "high" : undefined}
          currency={currency}
          discovery={
            discoveryOptions
              ? withDiscoveryPosition(
                  buildDiscoveryContext(discoveryOptions),
                  index,
                )
              : undefined
          }
          discoveryPageKey={discoveryPageKey}
        />
      ))}
    </div>
  );
}
