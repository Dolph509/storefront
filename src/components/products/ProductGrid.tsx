"use client";

import type { Product } from "@spree/sdk";
import { EmptyStateIllustration } from "@/components/empty-states/EmptyStateIllustration";
import {
  type SellerShopListId,
  sellerShopProductHrefForProduct,
} from "@/lib/discovery-context";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  basePath?: string;
  categoryId?: string;
  listId?: string;
  listName?: string;
  emptyMessage?: string;
  priorityCount?: number;
  /** Optional currency used for analytics in each ProductCard. */
  currency?: string;
  /** Serializable seller-shop attribution — PDP links built on the client. */
  sellerShopDiscovery?: {
    sellerId: string;
    listId: SellerShopListId;
    section?: string;
  };
  /** Denser grid for seller shop pages (Etsy-style). */
  density?: "standard" | "compact";
}

export function ProductGrid({
  products,
  basePath = "",
  categoryId,
  listId,
  listName,
  emptyMessage,
  priorityCount = 0,
  currency,
  sellerShopDiscovery,
  density = "standard",
}: ProductGridProps) {
  if (products.length === 0 && emptyMessage) {
    return (
      <div className="text-center py-12">
        <EmptyStateIllustration
          name="no-listings-yet"
          className="mx-auto mb-4 text-gray-600"
        />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  const gridClass =
    density === "compact"
      ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-3 gap-y-7 sm:gap-x-4 sm:gap-y-8"
      : "grid grid-cols-2 lg:grid-cols-3 gap-6";

  return (
    <div className={gridClass}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          href={
            sellerShopDiscovery
              ? sellerShopProductHrefForProduct(basePath, product, {
                  sellerId: sellerShopDiscovery.sellerId,
                  listId: sellerShopDiscovery.listId,
                  position: index,
                  section: sellerShopDiscovery.section,
                })
              : undefined
          }
          basePath={basePath}
          categoryId={categoryId}
          index={index}
          listId={listId}
          listName={listName}
          fetchPriority={index < priorityCount ? "high" : undefined}
          currency={currency}
          density={density}
        />
      ))}
    </div>
  );
}
