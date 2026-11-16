import type { Category } from "@spree/sdk";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MarketplacePage, MarketplaceSection } from "@/components/marketplace";
import { ProductImage } from "@/components/ui/product-image";
import {
  getEditorialCategories,
  resolveCatalogImageUrl,
} from "@/lib/marketplace-stock-images";

interface CategoryQuickLinksProps {
  categories: Category[];
  basePath: string;
  locale: string;
}

export async function CategoryQuickLinks({
  categories,
  basePath,
  locale,
}: CategoryQuickLinksProps) {
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
          imageUrl: resolveCatalogImageUrl(category.image_url, index),
        }))
      : getEditorialCategories(basePath);

  return (
    <MarketplaceSection
      surface="none"
      className="py-4 md:py-6"
      data-theme-section="category_circles"
    >
      <MarketplacePage>
        <h2 className="text-xl font-bold tracking-tight text-marketplace-foreground md:text-2xl">
          {t("mostLovedCategoriesTitle")}
        </h2>
        <ul className="mt-4 flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-6 md:gap-5 md:overflow-visible lg:grid-cols-8 [&::-webkit-scrollbar]:hidden">
          {items.map((category, index) => (
            <li key={category.id} className="w-[5.25rem] shrink-0 md:w-auto">
              <Link
                href={category.href}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <span className="relative size-[4.75rem] overflow-hidden rounded-full bg-marketplace-muted ring-1 ring-marketplace-border-subtle transition group-hover:ring-marketplace-brand md:size-[5.5rem]">
                  <ProductImage
                    src={category.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    iconClassName="size-8"
                    fetchPriority={index < 4 ? "high" : undefined}
                  />
                </span>
                <span className="line-clamp-2 text-xs font-semibold leading-tight text-marketplace-foreground group-hover:text-marketplace-brand">
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
