"use client";

import type { Product } from "@spree/sdk";
import { ProductCard } from "@/components/products/ProductCard";
import {
  type SellerShopListId,
  sellerShopProductHrefForProduct,
} from "@/lib/discovery-context";

export function SellerFeaturedGrid({
  products,
  basePath,
  sellerId,
  listId,
  listName,
}: {
  products: Product[];
  basePath: string;
  sellerId: string;
  listId: SellerShopListId;
  listName: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:auto-rows-[minmax(8rem,1fr)] md:grid-cols-4 md:gap-4">
      {products.map((product, index) => (
        <div
          key={product.id}
          className={index === 0 ? "md:col-span-2 md:row-span-2" : undefined}
        >
          <ProductCard
            product={product}
            basePath={basePath}
            index={index}
            listId={listId}
            listName={listName}
            density="rail"
            merchandisingSurface="seller_shop"
            suppressRelevanceReason
            href={sellerShopProductHrefForProduct(basePath, product, {
              sellerId,
              listId,
              position: index,
            })}
          />
        </div>
      ))}
    </div>
  );
}
