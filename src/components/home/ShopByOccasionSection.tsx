import type { Category } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MarketplacePage, MarketplaceSection } from "@/components/marketplace";
import { ProductImage } from "@/components/ui/product-image";
import {
  getOccasionCategories,
  resolveCatalogImageUrl,
} from "@/lib/marketplace-stock-images";

interface ShopByOccasionSectionProps {
  categories: Category[];
  basePath: string;
  locale: string;
}

export async function ShopByOccasionSection({
  categories,
  basePath,
  locale,
}: ShopByOccasionSectionProps) {
  const t = await getTranslations({
    locale: locale as Locale,
    namespace: "home",
  });
  const items =
    categories.length > 0
      ? categories.slice(0, 10).map((category, index) => ({
          id: category.id,
          name: category.name,
          href: `${basePath}/c/${category.permalink}`,
          imageUrl: resolveCatalogImageUrl(category.image_url, index + 3),
        }))
      : getOccasionCategories(basePath);

  if (!items.length) return null;

  return (
    <MarketplaceSection surface="none" className="py-4 md:py-6">
      <MarketplacePage>
        <h2 className="text-xl font-bold tracking-tight text-marketplace-foreground md:text-2xl">
          {t("seasonalPicksTitle")}
        </h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
          {items.map((category) => (
            <li key={category.id}>
              <Link href={category.href} className="group block text-center">
                <span className="relative block aspect-square overflow-hidden rounded-xl bg-marketplace-muted ring-1 ring-marketplace-border-subtle transition group-hover:ring-marketplace-brand">
                  <ProductImage
                    src={category.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    iconClassName="size-8"
                  />
                </span>
                <span className="mt-2 line-clamp-2 text-xs font-semibold leading-snug text-marketplace-foreground group-hover:text-marketplace-brand md:text-sm">
                  {category.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </MarketplacePage>
    </MarketplaceSection>
  );
}
