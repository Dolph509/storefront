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
}: ProductRecommendationRailProps) {
  if (!products.length) return null;

  const t = await getTranslations("home");

  return (
    <MarketplaceSection>
      <MarketplacePage>
        <MarketplaceSectionHeader
          title={title}
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
        />
      </MarketplacePage>
    </MarketplaceSection>
  );
}
