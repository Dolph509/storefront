import type { Product } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  MarketplacePage,
  MarketplaceSection,
  MarketplaceSectionHeader,
} from "@/components/marketplace";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import { Button } from "@/components/ui/button";

export type RecommendationSource =
  | "similar"
  | "shop"
  | "trending"
  | "new"
  | "followed_shops";

interface ProductRecommendationRailProps {
  title: string;
  products: Product[];
  basePath: string;
  currency?: string;
  listId: string;
  listName: string;
  moreHref?: string;
  moreLabel?: string;
  variant?: "default" | "etsy";
  homeRailKey?: "recommended-for-you" | "similar-to-saved";
}

export async function ProductRecommendationRail({
  title,
  products,
  basePath,
  currency,
  listId,
  listName,
  moreHref,
  moreLabel,
  variant = "default",
  homeRailKey,
}: ProductRecommendationRailProps) {
  if (!products.length) return null;

  const t = await getTranslations("home");

  return (
    <MarketplaceSection
      className={variant === "etsy" ? "py-4 sm:py-5" : undefined}
      data-home-rail={homeRailKey}
    >
      <MarketplacePage>
        <MarketplaceSectionHeader
          title={title}
          density={variant === "etsy" ? "home" : "default"}
          className={variant === "etsy" ? "mb-3" : undefined}
          action={
            moreHref ? (
              <Button variant="link" asChild>
                <Link href={moreHref}>{moreLabel ?? `${t("viewAll")} →`}</Link>
              </Button>
            ) : null
          }
        />
        <ProductCarousel
          products={products}
          basePath={basePath}
          currency={currency}
          listId={listId}
          listName={listName}
          variant={variant}
          homeRailSection={homeRailKey}
        />
      </MarketplacePage>
    </MarketplaceSection>
  );
}
