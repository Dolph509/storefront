"use client";

import type { Product } from "@spree/sdk";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  MarketplacePage,
  MarketplaceSection,
  MarketplaceSectionHeader,
} from "@/components/marketplace";
import { ProductGrid } from "@/components/products/ProductGrid";
import { getProductsByIds } from "@/lib/data/products";

export const RECENTLY_VIEWED_STORAGE_KEY = "spree-recently-viewed-products";
const STORAGE_KEY = RECENTLY_VIEWED_STORAGE_KEY;

export function RecentlyViewedProducts({
  productId,
  basePath,
  currency,
  heading,
  productCount = 8,
}: {
  productId: string;
  basePath: string;
  currency?: string;
  heading?: string;
  productCount?: number;
}) {
  const t = useTranslations("products");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    let previousIds: string[] = [];
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) || "[]",
      );
      previousIds = Array.isArray(saved)
        ? saved
            .filter(
              (id): id is string => typeof id === "string" && id !== productId,
            )
            .slice(0, Math.max(1, Math.min(productCount, 20)))
        : [];
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([productId, ...previousIds].slice(0, 9)),
      );
    } catch {
      previousIds = [];
    }
    if (previousIds.length)
      void getProductsByIds(previousIds)
        .then((items) => {
          if (!cancelled) setProducts(items);
        })
        .catch(() => {
          if (!cancelled) setProducts([]);
        });
    else setProducts([]);
    return () => {
      cancelled = true;
    };
  }, [productId, productCount]);

  if (!products.length) return null;
  return (
    <MarketplaceSection className="py-8">
      <MarketplacePage>
        <MarketplaceSectionHeader title={heading || t("recentlyViewed")} />
        <ProductGrid
          products={products}
          basePath={basePath}
          currency={currency}
        />
      </MarketplacePage>
    </MarketplaceSection>
  );
}
