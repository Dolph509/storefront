import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  MarketplacePage,
  MarketplaceSection,
  MarketplaceSectionHeader,
} from "@/components/marketplace";
import { ProductCarousel } from "@/components/products/ProductCarousel";
import { buttonVariants } from "@/components/ui/button";
import { PRODUCT_CARD_FIELDS } from "@/lib/data/cached";
import { getProducts } from "@/lib/data/products";
import { getNewArrivalProducts } from "@/lib/data/recommendations";
import { cn } from "@/lib/utils";

interface HomeCuratedProductRailProps {
  basePath: string;
  locale: string;
  currency?: string;
}

export async function HomeCuratedProductRail({
  basePath,
  locale,
  currency,
}: HomeCuratedProductRailProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const searchQuery = t("curatedProductRailSearchQuery");

  let products =
    (
      await getProducts({
        search: searchQuery,
        limit: 14,
        fields: PRODUCT_CARD_FIELDS,
        expand: ["seller"],
      }).catch(() => ({ data: [] }))
    ).data ?? [];

  if (!products.length) {
    products = await getNewArrivalProducts();
  }

  if (!products.length) return null;

  const viewAllHref = `${basePath}/products?q=${encodeURIComponent(searchQuery)}`;

  return (
    <MarketplaceSection surface="warm" className="py-8 md:py-10">
      <MarketplacePage>
        <MarketplaceSectionHeader
          density="compact"
          title={t("curatedProductRailTitle")}
          action={
            <Link
              href={viewAllHref}
              className={cn(
                buttonVariants({ variant: "link", size: "sm" }),
                "text-marketplace-brand",
              )}
            >
              {t("viewAll")} →
            </Link>
          }
        />
        <ProductCarousel
          products={products}
          basePath={basePath}
          currency={currency}
          listId="home-curated-rail"
          listName={t("curatedProductRailTitle")}
        />
      </MarketplacePage>
    </MarketplaceSection>
  );
}
