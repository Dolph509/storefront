import type { Category } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  MarketplaceGrid,
  MarketplacePage,
  MarketplaceSection,
  MarketplaceSectionHeader,
} from "@/components/marketplace";
import { MarketplaceEditorialTile } from "@/components/marketplace/MarketplaceEditorialTile";

interface CategoryBrowseGridProps {
  categories: Category[];
  basePath: string;
  locale: string;
}

export async function CategoryBrowseGrid({
  categories,
  basePath,
  locale,
}: CategoryBrowseGridProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });

  if (!categories.length) return null;

  return (
    <MarketplaceSection>
      <MarketplacePage>
        <MarketplaceSectionHeader
          title={t("browseByInterest")}
          description={t("browseByInterestDescription")}
        />
        <MarketplaceGrid className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <MarketplaceEditorialTile
              key={category.id}
              href={`${basePath}/c/${category.permalink}`}
              title={category.name}
              imageUrl={category.image_url}
              aspect="square"
            />
          ))}
        </MarketplaceGrid>
        <div className="mt-6 text-center">
          <Link
            href={`${basePath}/products`}
            className="text-sm font-medium text-marketplace-brand underline-offset-4 hover:underline"
          >
            {t("viewAll")} →
          </Link>
        </div>
      </MarketplacePage>
    </MarketplaceSection>
  );
}
