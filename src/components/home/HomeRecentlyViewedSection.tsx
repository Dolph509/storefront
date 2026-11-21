"use client";

import type { Product } from "@spree/sdk";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  MarketplacePage,
  MarketplaceSection,
  MarketplaceSectionHeader,
} from "@/components/marketplace";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import { RECENTLY_VIEWED_STORAGE_KEY } from "@/components/products/RecentlyViewedProducts";
import { getProductsByIds } from "@/lib/data/products";

interface HomeRecentlyViewedSectionProps {
  basePath: string;
  currency?: string;
}

export function HomeRecentlyViewedSection({
  basePath,
  currency,
}: HomeRecentlyViewedSectionProps) {
  const t = useTranslations("products");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    let ids: string[] = [];
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY) || "[]",
      );
      ids = Array.isArray(saved)
        ? saved.filter((id): id is string => typeof id === "string").slice(0, 8)
        : [];
    } catch {
      ids = [];
    }
    if (!ids.length) return;
    void getProductsByIds(ids)
      .then((items) => {
        if (!cancelled) setProducts(items);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!products.length) return null;

  return (
    <MarketplaceSection
      surface="none"
      className="py-10 md:py-12"
      data-theme-section="recently_viewed"
    >
      <MarketplacePage>
        <MarketplaceSectionHeader title={t("recentlyViewed")} density="home" />
        <ProductCarousel
          products={products}
          basePath={basePath}
          currency={currency}
          listId="home-recently-viewed"
          listName={t("recentlyViewed")}
          variant="etsy"
        />
      </MarketplacePage>
    </MarketplaceSection>
  );
}
